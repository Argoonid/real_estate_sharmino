import { useQuery } from '@tanstack/react-query';
import { SupabaseService } from '../../../shared/api/supabase';

export const DISTRICTS_QUERY_KEY = ['districts'];

export function useDistrictsQuery() {
  return useQuery({
    queryKey: DISTRICTS_QUERY_KEY,
    queryFn: () => SupabaseService.fetchDistricts(),
    staleTime: 1000 * 60 * 5,
  });
}
