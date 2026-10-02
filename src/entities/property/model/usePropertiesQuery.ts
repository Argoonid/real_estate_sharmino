import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { FilterState } from '../../../shared/types';
import { SupabaseService } from '../../../shared/api/supabase';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { UNLIMITED_PRICE } from '../../../shared/lib/formatters';

const PAGE_SIZE = 24;

export const PROPERTIES_QUERY_KEY = ['properties'];

function requiresExchangeRates(filter: FilterState): boolean {
  return (
    !filter.priceOnRequestOnly &&
    (filter.minPrice > 0 || filter.maxPrice < UNLIMITED_PRICE)
  );
}

export function useInfinitePropertiesQuery(
  filter: FilterState,
  options: {
    favoriteIds?: string[];
  } = {},
) {
  const favoriteIds = options.favoriteIds ? [...options.favoriteIds].sort() : undefined;
  const exchangeRatesQuery = useExchangeRates();

  return useInfiniteQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, filter, favoriteIds, exchangeRatesQuery.data],
    queryFn: ({ pageParam }) =>
      SupabaseService.fetchProperties(filter, {
        page: pageParam,
        pageSize: PAGE_SIZE,
        favoriteIds,
        exchangeRates: exchangeRatesQuery.data,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !requiresExchangeRates(filter) || exchangeRatesQuery.isSuccess,
    select: (result) => ({
      pages: result.pages.flatMap((page) => page.properties),
      pageParams: result.pageParams,
      total: result.pages[0]?.total ?? 0,
    }),
  });
}

export function useAllMapPropertiesQuery(
  filter: FilterState,
  options: { favoriteIds?: string[]; enabled?: boolean } = {},
) {
  const favoriteIds = options.favoriteIds ? [...options.favoriteIds].sort() : undefined;
  const exchangeRatesQuery = useExchangeRates();

  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, 'map', filter, favoriteIds, exchangeRatesQuery.data],
    queryFn: () =>
      SupabaseService.fetchAllProperties(filter, {
        favoriteIds,
        exchangeRates: exchangeRatesQuery.data,
      }),
    staleTime: 30_000,
    enabled:
      (options.enabled ?? true) &&
      (!requiresExchangeRates(filter) || exchangeRatesQuery.isSuccess),
  });
}

export function usePropertyQuery(idOrSlug: string | null) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, 'detail', idOrSlug],
    queryFn: () => SupabaseService.fetchProperty(idOrSlug!),
    enabled: Boolean(idOrSlug),
  });
}

export function useRecentPropertiesQuery() {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, 'recent'],
    queryFn: () => SupabaseService.fetchRecentProperties(),
  });
}

export function usePropertiesByIdsQuery(ids: string[]) {
  const uniqueIds = [...new Set(ids)].sort();
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, 'ids', uniqueIds],
    queryFn: () => SupabaseService.fetchPropertiesByIds(uniqueIds),
    enabled: uniqueIds.length > 0,
  });
}