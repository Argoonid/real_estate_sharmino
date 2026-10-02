import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../../config/env';
import type { Database } from '../types/database.types';
import type { Currency, DatabaseProperty, DealType, District, FilterState, PropertyType } from '../types';
import type { ExchangeRates } from '../lib/exchangeRates';
import { UNLIMITED_PRICE } from '../lib/formatters';
import { parseSmartSearch } from '../lib/smartSearch';

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type DistrictRow = Database['public']['Tables']['districts']['Row'];
export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export interface PropertyQueryOptions {
  page?: number;
  pageSize?: number;
  favoriteIds?: string[];
  includeInactive?: boolean;
  exchangeRates?: ExchangeRates;
}

export interface PropertyPage {
  properties: DatabaseProperty[];
  total: number;
  nextPage: number | null;
}

let client: SupabaseClient<Database> | undefined;

const dealTypes = ['sale', 'long_term_rent', 'daily_rent'] as const satisfies readonly DealType[];
const propertyTypes = ['studio', 'apartment', 'villa', 'penthouse', 'chalet', 'duplex', 'commercial'] as const satisfies readonly PropertyType[];
const currencies = ['USD', 'EUR', 'GBP', 'EGP', 'RUB'] as const satisfies readonly Currency[];
const utilityTypes = ['excluded', 'included', 'on_meter'] as const;

function isOneOf<const Values extends readonly string[]>(
  value: string,
  values: Values,
): value is Values[number] {
  return values.includes(value);
}

export function isSupabaseConfigured(): boolean {
  return ENV.SUPABASE_CONFIG_ERROR === null;
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(ENV.SUPABASE_CONFIG_ERROR ?? 'Supabase is not configured.');
  }

  if (!client) {
    client = createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  }
  return client;
}

function toDistrict(
  row: DistrictRow,
  center?: { lat: number; lng: number },
): District {
  const rowLat = typeof row.lat === 'number' ? row.lat : Number.NaN;
  const rowLng = typeof row.lng === 'number' ? row.lng : Number.NaN;
  return {
    id: row.id,
    name_ru: row.name_ru,
    name_en: row.name_en,
    slug: row.slug,
    lat: Number.isFinite(rowLat) ? rowLat : center?.lat ?? null,
    lng: Number.isFinite(rowLng) ? rowLng : center?.lng ?? null,
    created_at: row.created_at,
  };
}

function toProperty(row: PropertyRow, districtsById: Map<string, District>): DatabaseProperty {
  const currency = row.price_currency;
  if (!isOneOf(currency, currencies)) {
    throw new Error(`Unsupported property currency "${currency}" for property "${row.id}".`);
  }
  if (!isOneOf(row.deal, dealTypes)) {
    throw new Error(`Unsupported deal type "${row.deal}" for property "${row.id}".`);
  }
  if (!isOneOf(row.type, propertyTypes)) {
    throw new Error(`Unsupported property type "${row.type}" for property "${row.id}".`);
  }
  if (!isOneOf(row.utilities, utilityTypes)) {
    throw new Error(`Unsupported utilities value "${row.utilities}" for property "${row.id}".`);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    deal: row.deal,
    type: row.type,
    is_active: row.is_active,
    price: {
      amount: Number(row.price_amount),
      currency,
      egp_standard: Number(row.price_egp_standard),
      is_price_on_request: row.is_price_on_request,
      deposit: row.deposit === null ? null : Number(row.deposit),
      utilities: row.utilities,
    },
    specs: {
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area_sqm: Number(row.area_sqm),
      floor: row.floor,
      total_floors: row.total_floors,
      view: row.view ?? '',
      is_furnished: row.is_furnished,
      has_balcony: row.has_balcony,
      has_garden: row.has_garden,
      has_beach_access: row.has_beach_access,
      amenities: row.amenities ?? [],
    },
    location: {
      district: row.district_id ? districtsById.get(row.district_id) ?? null : null,
      compound: row.compound_name
        ? { name_ru: row.compound_name, name_en: row.compound_name }
        : undefined,
      coordinates: { lat: Number(row.lat), lng: Number(row.lng) },
    },
    description: row.description,
    images: row.images,
    source: row.source_platform
      ? {
          platform: row.source_platform,
          external_id: row.source_external_id ?? '',
          origin_url: row.source_origin_url ?? '',
          contact: row.source_contact ?? undefined,
        }
      : undefined,
    created_at: row.created_at,
    views_count: row.views_count,
  };
}

function escapePostgrestPattern(value: string): string {
  return `*${value.replace(/[\\"]/g, '\\$&').replace(/[(),]/g, ' ')}*`;
}

export class SupabaseService {
  public static isConfigured = isSupabaseConfigured;

  public static async getAdminSession() {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    const user = data.session?.user;
    return user?.app_metadata.role === 'admin' ? user : null;
  }

  public static async signInAdmin(email: string, password: string): Promise<void> {
    const db = getSupabaseClient();
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user.app_metadata.role !== 'admin') {
      await db.auth.signOut();
      throw new Error('У этой учетной записи нет роли администратора.');
    }
  }

  public static async fetchDistricts(): Promise<District[]> {
    const db = getSupabaseClient();
    const [{ data: districtRows, error: districtError }, centers] = await Promise.all([
      db.from('districts').select('*').order('name_ru'),
      this.fetchDistrictCenters(db),
    ]);
    if (districtError) throw districtError;
    return districtRows.map((row) => toDistrict(row, centers.get(row.id)));
  }

  private static async fetchDistrictCenters(
    db: SupabaseClient<Database>,
  ): Promise<Map<string, { lat: number; lng: number }>> {
    const sums = new Map<string, { lat: number; lng: number; count: number }>();
    const pageSize = 1000;
    let from = 0;
    let total = 0;

    do {
      const { data, error, count } = await db
        .from('properties')
        .select('district_id, lat, lng', { count: 'exact' })
        .eq('is_active', true)
        .not('district_id', 'is', null)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      total = count ?? data.length;

      for (const row of data) {
        if (!row.district_id || !Number.isFinite(row.lat) || !Number.isFinite(row.lng)) continue;
        const sum = sums.get(row.district_id) ?? { lat: 0, lng: 0, count: 0 };
        sum.lat += row.lat;
        sum.lng += row.lng;
        sum.count += 1;
        sums.set(row.district_id, sum);
      }

      from += data.length;
      if (data.length === 0) break;
    } while (from < total);

    return new Map(
      [...sums].map(([id, sum]) => [
        id,
        {
          lat: Math.round((sum.lat / sum.count) * 100) / 100,
          lng: Math.round((sum.lng / sum.count) * 100) / 100,
        },
      ]),
    );
  }

  public static async fetchProperties(
    filter: FilterState,
    options: PropertyQueryOptions = {},
  ): Promise<PropertyPage> {
    return this.fetchPropertiesPage(filter, options);
  }

  private static async fetchPropertiesPage(
    filter: FilterState,
    options: PropertyQueryOptions = {},
    districtsPromise: Promise<District[]> = this.fetchDistricts(),
  ): Promise<PropertyPage> {
    const db = getSupabaseClient();
    if (options.favoriteIds?.length === 0) {
      return { properties: [], total: 0, nextPage: null };
    }
    const page = Math.max(0, options.page ?? 0);
    const pageSize = Math.max(1, Math.min(options.pageSize ?? 24, 100));
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = db
      .from('properties')
      .select('*', { count: 'exact' });

    if (!options.includeInactive) query = query.eq('is_active', true);
    if (filter.deal !== 'all') query = query.eq('deal', filter.deal);
    if (filter.districtId !== 'all') query = query.eq('district_id', filter.districtId);
    if (filter.propertyType !== 'all') query = query.eq('type', filter.propertyType);

    if (filter.bedrooms === '4+') query = query.gte('bedrooms', 4);
    else if (filter.bedrooms !== 'all') query = query.eq('bedrooms', Number(filter.bedrooms));
    if (filter.bathrooms === '3+') query = query.gte('bathrooms', 3);
    else if (filter.bathrooms !== 'all') query = query.eq('bathrooms', Number(filter.bathrooms));

    if (filter.minArea > 0) query = query.gte('area_sqm', filter.minArea);
    if (filter.maxArea < UNLIMITED_PRICE) query = query.lte('area_sqm', filter.maxArea);
    if (filter.seaViewOnly) query = query.eq('view', 'sea_view');
    if (filter.beachAccessOnly) query = query.eq('has_beach_access', true);
    if (filter.poolOnly) query = query.overlaps('amenities', ['pool', 'swimming_pool', 'private_pool']);
    if (filter.furnishedOnly) query = query.eq('is_furnished', true);
    if (filter.balconyOnly) query = query.eq('has_balcony', true);
    if (filter.gardenOnly) query = query.eq('has_garden', true);

    if (filter.priceOnRequestOnly) {
      query = query.eq('is_price_on_request', true);
    } else if (filter.minPrice > 0 || filter.maxPrice < UNLIMITED_PRICE) {
      const rates = options.exchangeRates;
      if (!rates) {
        throw new Error('Курсы валют ещё не загружены; невозможно применить фильтр цены.');
      }
      const boundsByCurrency = currencies.map((currency) => {
        const parts = [`price_currency.eq.${currency}`, 'is_price_on_request.eq.false'];
        if (filter.minPrice > 0) {
          parts.push(`price_amount.gte.${filter.minPrice / rates[filter.currency] * rates[currency]}`);
        }
        if (filter.maxPrice < UNLIMITED_PRICE) {
          parts.push(`price_amount.lte.${filter.maxPrice / rates[filter.currency] * rates[currency]}`);
        }
        return `and(${parts.join(',')})`;
      });
      query = query.or(boundsByCurrency.join(','));
    }

    if (options.favoriteIds) {
      query = query.in('id', options.favoriteIds);
    }

    const rawSearch = filter.searchQuery.trim();
    if (rawSearch) {
      const smart = parseSmartSearch(rawSearch);

      // 1. Поиск по номеру или ID
      if (smart.idCode) {
        const idPattern = `%${smart.idCode}%`;
        const idConditions = [
          `id.ilike.${idPattern}`,
          `slug.ilike.${idPattern}`,
          `title.ilike.${idPattern}`,
          `source_external_id.ilike.${idPattern}`,
        ];
        query = query.or(idConditions.join(','));
      }

      // 2. Распознанные параметры (район, тип жилья, число комнат, сделка)
      if (smart.districts.length > 0 && filter.districtId === 'all') {
        const districtList = smart.districts.join(',');
        const distPatterns = smart.districts.map((d) => `title.ilike.%${d}%`).join(',');
        query = query.or(`district_id.in.(${districtList}),${distPatterns}`);
      }
      if (smart.propertyTypes.length > 0 && filter.propertyType === 'all') {
        const typeList = smart.propertyTypes.join(',');
        query = query.in('type', smart.propertyTypes);
      }
      if (smart.dealTypes.length > 0 && filter.deal === 'all') {
        query = query.in('deal', smart.dealTypes);
      }
      if (smart.bedrooms !== null && filter.bedrooms === 'all') {
        query = query.eq('bedrooms', smart.bedrooms);
      }
      if (smart.features.includes('sea_view') && !filter.seaViewOnly) {
        query = query.eq('view', 'sea_view');
      }
      if (smart.features.includes('beach_access') && !filter.beachAccessOnly) {
        query = query.eq('has_beach_access', true);
      }
      if (smart.features.includes('pool') && !filter.poolOnly) {
        query = query.overlaps('amenities', ['pool', 'swimming_pool', 'private_pool']);
      }
      if (smart.features.includes('furnished') && !filter.furnishedOnly) {
        query = query.eq('is_furnished', true);
      }

      // 3. Текстовые ключевые слова (поиск по названию, описанию и адресу)
      if (smart.textTerms.length > 0) {
        for (const term of smart.textTerms) {
          const clean = term.replace(/[(),"\\]/g, '').trim();
          if (clean.length > 1) {
            const pattern = `%${clean}%`;
            query = query.or(`title.ilike.${pattern},description.ilike.${pattern},compound_name.ilike.${pattern}`);
          }
        }
      } else if (!smart.isStructuredSearch && !smart.idCode) {
        const cleanPattern = `%${rawSearch.replace(/\s+/g, '%').replace(/[(),"\\]/g, '')}%`;
        query = query.or(`title.ilike.${cleanPattern},description.ilike.${cleanPattern},compound_name.ilike.${cleanPattern}`);
      }
    }

    const orderBy = filter.sortBy === 'price_asc'
      ? { column: 'price_egp_standard' as const, ascending: true }
      : filter.sortBy === 'price_desc'
        ? { column: 'price_egp_standard' as const, ascending: false }
        : filter.sortBy === 'area_desc'
          ? { column: 'area_sqm' as const, ascending: false }
          : { column: 'created_at' as const, ascending: false };
    query = query
      .order(orderBy.column, { ascending: orderBy.ascending })
      .order('id', { ascending: true })
      .range(from, to);

    const [{ data, error, count }, districts] = await Promise.all([
      query,
      districtsPromise,
    ]);
    if (error) throw error;

    const districtsById = new Map(districts.map((district) => [district.id, district]));
    const properties = data.map((row) => toProperty(row, districtsById));
    const total = count ?? 0;
    return {
      properties,
      total,
      nextPage: from + properties.length < total ? page + 1 : null,
    };
  }

  public static async fetchAllProperties(
    filter: FilterState,
    options: Pick<PropertyQueryOptions, 'favoriteIds' | 'exchangeRates' | 'includeInactive'> = {},
  ): Promise<DatabaseProperty[]> {
    if (options.favoriteIds?.length === 0) return [];

    const districtsPromise = this.fetchDistricts();
    const properties: DatabaseProperty[] = [];
    let page = 0;
    let nextPage: number | null = 0;

    while (nextPage !== null) {
      const result = await this.fetchPropertiesPage(
        filter,
        {
          page,
          pageSize: 100,
          favoriteIds: options.favoriteIds,
          exchangeRates: options.exchangeRates,
          includeInactive: options.includeInactive,
        },
        districtsPromise,
      );
      properties.push(...result.properties);
      nextPage = result.nextPage;
      if (nextPage !== null) page = nextPage;
    }

    return properties;
  }

  public static async fetchProperty(idOrSlug: string): Promise<DatabaseProperty | null> {
    const db = getSupabaseClient();
    let { data, error } = await db.from('properties').select('*').eq('id', idOrSlug).maybeSingle();
    if (error) throw error;
    if (!data) {
      ({ data, error } = await db.from('properties').select('*').eq('slug', idOrSlug).maybeSingle());
      if (error) throw error;
    }
    if (!data) return null;

    const districts = await this.fetchDistricts();
    return toProperty(data, new Map(districts.map((district) => [district.id, district])));
  }

  public static async fetchRecentProperties(pageSize = 24): Promise<DatabaseProperty[]> {
    const db = getSupabaseClient();
    const limit = Math.max(1, Math.min(pageSize, 100));
    const [{ data, error }, districts] = await Promise.all([
      db
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(0, limit - 1),
      this.fetchDistricts(),
    ]);
    if (error) throw error;
    const districtsById = new Map(districts.map((district) => [district.id, district]));
    return data.map((row) => toProperty(row, districtsById));
  }

  public static async fetchPropertiesByIds(ids: string[]): Promise<DatabaseProperty[]> {
    if (ids.length === 0) return [];

    const db = getSupabaseClient();
    const [{ data, error }, districts] = await Promise.all([
      db.from('properties').select('*').eq('is_active', true).in('id', ids),
      this.fetchDistricts(),
    ]);
    if (error) throw error;
    const districtsById = new Map(districts.map((district) => [district.id, district]));
    const propertiesById = new Map(data.map((row) => [row.id, toProperty(row, districtsById)]));
    return ids.flatMap((id) => {
      const property = propertiesById.get(id);
      return property ? [property] : [];
    });
  }

  public static async updateProperty(id: string, update: PropertyUpdate): Promise<void> {
    const { error } = await getSupabaseClient().from('properties').update(update).eq('id', id);
    if (error) throw error;
  }

  public static async fetchLeads(): Promise<LeadRow[]> {
    const { data, error } = await getSupabaseClient()
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  public static async checkHealth(): Promise<{ connected: boolean; error?: string }> {
    const { error } = await getSupabaseClient().from('districts').select('id').limit(1);
    return error ? { connected: false, error: error.message } : { connected: true };
  }
}
