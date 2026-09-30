import type { BookingRequest } from '../shared/types';
import { getSupabaseClient, type LeadInsert, type LeadRow } from '../shared/api/supabase';
import { formatPrice, getBasePriceUSD } from '../shared/lib/formatters';

export { formatPrice, getBasePriceUSD };
export type { LeadRow };

export async function dispatchBookingLead(booking: BookingRequest): Promise<void> {
  const lead: LeadInsert = {
    property_id: booking.propertyId || null,
    client_name: booking.clientName.trim(),
    client_phone: booking.clientPhone.trim(),
    client_telegram: booking.clientTelegram.trim() || null,
    viewing_date: booking.viewingDate,
    viewing_time: booking.viewingTime,
    viewing_type: booking.viewingType,
    notes: booking.notes?.trim() || null,
    status: 'pending',
  };

  const { error } = await getSupabaseClient().from('leads').insert(lead);
  if (error) throw error;
}

export async function getBookingLeads(): Promise<LeadRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
