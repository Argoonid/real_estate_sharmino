export type DealType = 'sale' | 'long_term_rent' | 'daily_rent';

export type PropertyType = 'studio' | 'apartment' | 'villa' | 'penthouse' | 'chalet' | 'duplex' | 'commercial';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'RUB';

export type PageId = 'home' | 'catalog' | 'popular' | 'districts' | 'admin' | 'property';

// Unified Database JSON structure
export interface DatabaseProperty {
  id: string;
  slug: string;
  title: string;
  deal: DealType;
  type: PropertyType;
  is_active: boolean;
  price: {
    amount: number;
    currency: Currency;
    egp_standard: number;
    is_price_on_request: boolean;
    deposit: number | null;
    utilities: 'excluded' | 'included' | 'on_meter';
  };
  specs: {
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    floor: number | null;
    total_floors: number | null;
    view: 'sea_view' | 'pool_view' | 'garden_view' | 'mountain_view' | string;
    is_furnished: boolean;
    has_balcony: boolean;
    has_garden: boolean;
    has_beach_access: boolean;
    amenities: string[];
  };
  location: {
    district: District | null;
    compound?: {
      name_ru: string;
      name_en?: string;
    };
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  images: string[];
  views_count?: number | null;
  source?: {
    platform: string;
    external_id: string;
    origin_url: string;
    contact?: string;
  };
  created_at: string;
}

export type Property = DatabaseProperty;

export interface District {
  id: string;
  name_ru: string;
  name_en: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  created_at?: string;
}

export interface FilterState {
  deal: DealType | 'all';
  dealType?: DealType | 'all';
  districtId: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  maxDistanceToBeach?: number;
  currency: Currency;
  seaViewOnly: boolean;
  beachAccessOnly: boolean;
  poolOnly: boolean;
  furnishedOnly: boolean;
  balconyOnly: boolean;
  gardenOnly: boolean;
  priceOnRequestOnly: boolean;
  greenContractOnly?: boolean;
  installmentsOnly?: boolean;
  privateBeachOnly?: boolean;
  readyOnly?: boolean;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'area_desc' | 'newest';
  searchQuery: string;
}

export interface AlertSubscription {
  id: string;
  emailOrTg: string;
  dealType: DealType;
  districtId: string;
  maxPrice: number;
  createdAt: string;
}

export type PreferredContact = 'whatsapp' | 'telegram' | 'phone';

export interface BookingRequest {
  propertyId: string;
  clientName: string;
  clientPhone: string;
  clientTelegram?: string;
  preferredContact?: PreferredContact;
  viewingDate: string;
  viewingTime: string;
  viewingType: 'in_person' | 'online_video' | 'rent_reserve';
  notes?: string;
}

export interface AnonymousUserProfile {
  version: number;
  exportedAt: string;
  favorites: string[];
  recentViews: string[];
  compareIds: string[];
}
