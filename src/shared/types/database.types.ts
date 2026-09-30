export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      districts: {
        Row: {
          id: string;
          name_ru: string;
          name_en: string;
          slug: string;
          lat: number;
          lng: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name_ru: string;
          name_en: string;
          slug: string;
          lat: number;
          lng: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_ru?: string;
          name_en?: string;
          slug?: string;
          lat?: number;
          lng?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          slug: string;
          title: string;
          deal: string;
          type: string;
          is_active: boolean;
          price_amount: number;
          price_currency: string;
          price_egp_standard: number;
          is_price_on_request: boolean;
          deposit: number | null;
          utilities: string;
          bedrooms: number;
          bathrooms: number;
          area_sqm: number;
          floor: number | null;
          total_floors: number | null;
          view: string | null;
          is_furnished: boolean;
          has_balcony: boolean;
          has_garden: boolean;
          has_beach_access: boolean;
          amenities: string[] | null;
          district_id: string | null;
          compound_name: string | null;
          lat: number;
          lng: number;
          description: string;
          images: string[];
          source_platform: string | null;
          source_external_id: string | null;
          source_origin_url: string | null;
          source_contact: string | null;
          views_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          deal?: string;
          type?: string;
          is_active?: boolean;
          price_amount?: number;
          price_currency?: string;
          price_egp_standard?: number;
          is_price_on_request?: boolean;
          deposit?: number | null;
          utilities?: string;
          bedrooms?: number;
          bathrooms?: number;
          area_sqm?: number;
          floor?: number | null;
          total_floors?: number | null;
          view?: string | null;
          is_furnished?: boolean;
          has_balcony?: boolean;
          has_garden?: boolean;
          has_beach_access?: boolean;
          amenities?: string[] | null;
          district_id?: string | null;
          compound_name?: string | null;
          lat: number;
          lng: number;
          description?: string;
          images?: string[];
          source_platform?: string | null;
          source_external_id?: string | null;
          source_origin_url?: string | null;
          source_contact?: string | null;
          views_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          deal?: string;
          type?: string;
          is_active?: boolean;
          price_amount?: number;
          price_currency?: string;
          price_egp_standard?: number;
          is_price_on_request?: boolean;
          deposit?: number | null;
          utilities?: string;
          bedrooms?: number;
          bathrooms?: number;
          area_sqm?: number;
          floor?: number | null;
          total_floors?: number | null;
          view?: string | null;
          is_furnished?: boolean;
          has_balcony?: boolean;
          has_garden?: boolean;
          has_beach_access?: boolean;
          amenities?: string[] | null;
          district_id?: string | null;
          compound_name?: string | null;
          lat?: number;
          lng?: number;
          description?: string;
          images?: string[];
          source_platform?: string | null;
          source_external_id?: string | null;
          source_origin_url?: string | null;
          source_contact?: string | null;
          views_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_district_id_fkey';
            columns: ['district_id'];
            isOneToOne: false;
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          property_id: string | null;
          client_name: string;
          client_phone: string;
          client_telegram: string | null;
          viewing_date: string;
          viewing_time: string;
          viewing_type: string;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          client_name: string;
          client_phone: string;
          client_telegram?: string | null;
          viewing_date: string;
          viewing_time: string;
          viewing_type?: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          client_name?: string;
          client_phone?: string;
          client_telegram?: string | null;
          viewing_date?: string;
          viewing_time?: string;
          viewing_type?: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
