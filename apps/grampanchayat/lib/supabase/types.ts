// Client mirror of the public Supabase schema. Regenerate with:
//   supabase gen types typescript --project-id kntraxcpflpptmtlqqvv > lib/supabase/types.ts
// After `supabase gen`, merge the `gp_tenants` (and other) blocks if the CLI output
// lags; Drizzle migrations in `apps/grampanchayat-api` are the migration source of truth.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          category: string
          content_en: string | null
          content_mr: string | null
          created_at: string
          doc_url: string | null
          gp_id: string
          id: string
          is_published: boolean
          published_at: string | null
          title_en: string
          title_mr: string
        }
        Insert: {
          category?: string
          content_en?: string | null
          content_mr?: string | null
          created_at?: string
          doc_url?: string | null
          gp_id: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title_en: string
          title_mr: string
        }
        Update: {
          category?: string
          content_en?: string | null
          content_mr?: string | null
          created_at?: string
          doc_url?: string | null
          gp_id?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title_en?: string
          title_mr?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          caption: string | null
          event_id: string
          gp_id: string
          id: string
          sort_order: number
          type: string
          url: string
        }
        Insert: {
          caption?: string | null
          event_id: string
          gp_id: string
          id?: string
          sort_order?: number
          type: string
          url: string
        }
        Update: {
          caption?: string | null
          event_id?: string
          gp_id?: string
          id?: string
          sort_order?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description_en: string | null
          description_mr: string | null
          event_date: string
          gp_id: string
          id: string
          is_published: boolean
          location_en: string | null
          location_mr: string | null
          title_en: string
          title_mr: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_mr?: string | null
          event_date: string
          gp_id: string
          id?: string
          is_published?: boolean
          location_en?: string | null
          location_mr?: string | null
          title_en: string
          title_mr: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_mr?: string | null
          event_date?: string
          gp_id?: string
          id?: string
          is_published?: boolean
          location_en?: string | null
          location_mr?: string | null
          title_en?: string
          title_mr?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          caption_en: string | null
          caption_mr: string | null
          gp_id: string
          id: string
          sort_order: number
          taken_at: string | null
          type: string
          url: string
        }
        Insert: {
          caption_en?: string | null
          caption_mr?: string | null
          gp_id: string
          id?: string
          sort_order?: number
          taken_at?: string | null
          type: string
          url: string
        }
        Update: {
          caption_en?: string | null
          caption_mr?: string | null
          gp_id?: string
          id?: string
          sort_order?: number
          taken_at?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gp_admins: {
        Row: {
          deleted_at: string | null
          gp_id: string
          id: string
          is_active: boolean
          role: string
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          gp_id: string
          id?: string
          is_active?: boolean
          role?: string
          user_id: string
        }
        Update: {
          deleted_at?: string | null
          gp_id?: string
          id?: string
          is_active?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gp_admins_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gp_tenants: {
        Row: {
          contact: Json | null
          created_at: string
          established: string | null
          feature_flags: Json
          id: string
          logo_url: string | null
          name_en: string
          name_mr: string
          portal_config: Json
          portal_theme: string
          subdomain: string
          tier: string
          village: Json | null
        }
        Insert: {
          contact?: Json | null
          created_at?: string
          established?: string | null
          feature_flags?: Json
          id?: string
          logo_url?: string | null
          name_en: string
          name_mr: string
          portal_config?: Json
          portal_theme?: string
          subdomain: string
          tier?: string
          village?: Json | null
        }
        Update: {
          contact?: Json | null
          created_at?: string
          established?: string | null
          feature_flags?: Json
          id?: string
          logo_url?: string | null
          name_en?: string
          name_mr?: string
          portal_config?: Json
          portal_theme?: string
          subdomain?: string
          tier?: string
          village?: Json | null
        }
        Relationships: []
      }
      /**
       * Synced with apps/grampanchayat-api Drizzle — RLS: not exposed to browser in v1; API uses direct DB.
       * If you add Supabase client reads, enable RLS + policies for gp_id + gp_admins.
       */
      gp_citizens: {
        Row: {
          aadhaar_last4: string | null
          address_mr: string
          citizen_no: number
          created_at: string
          gp_id: string
          household_id: string | null
          id: string
          mobile: string
          name_en: string | null
          name_mr: string
          updated_at: string
          ward_number: string
        }
        Insert: {
          aadhaar_last4?: string | null
          address_mr: string
          citizen_no: number
          created_at?: string
          gp_id: string
          household_id?: string | null
          id?: string
          mobile: string
          name_en?: string | null
          name_mr: string
          updated_at?: string
          ward_number: string
        }
        Update: {
          aadhaar_last4?: string | null
          address_mr?: string
          citizen_no?: number
          created_at?: string
          gp_id?: string
          household_id?: string | null
          id?: string
          mobile?: string
          name_en?: string | null
          name_mr?: string
          updated_at?: string
          ward_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "gp_citizens_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gp_properties: {
        Row: {
          age_bracket: string | null
          assessment_date: string | null
          assessment_inputs: Json | null
          created_at: string
          gp_id: string
          id: string
          length_ft: number | null
          occupant_name: string
          owner_citizen_id: string
          plot_or_gat: string | null
          property_no: string
          property_type: string
          resolution_ref: string | null
          survey_number: string | null
          updated_at: string
          width_ft: number | null
        }
        Insert: {
          age_bracket?: string | null
          assessment_date?: string | null
          assessment_inputs?: Json | null
          created_at?: string
          gp_id: string
          id?: string
          length_ft?: number | null
          occupant_name: string
          owner_citizen_id: string
          plot_or_gat?: string | null
          property_no: string
          property_type: string
          resolution_ref?: string | null
          survey_number?: string | null
          updated_at?: string
          width_ft?: number | null
        }
        Update: {
          age_bracket?: string | null
          assessment_date?: string | null
          assessment_inputs?: Json | null
          created_at?: string
          gp_id?: string
          id?: string
          length_ft?: number | null
          occupant_name?: string
          owner_citizen_id?: string
          plot_or_gat?: string | null
          property_no?: string
          property_type?: string
          resolution_ref?: string | null
          survey_number?: string | null
          updated_at?: string
          width_ft?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gp_properties_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gp_properties_owner_citizen_id_fkey"
            columns: ["owner_citizen_id"]
            isOneToOne: false
            referencedRelation: "gp_citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      post_holders: {
        Row: {
          gp_id: string
          id: string
          is_active: boolean
          name_en: string
          name_mr: string
          phone: string | null
          photo_url: string | null
          post_en: string
          post_mr: string
          sort_order: number
        }
        Insert: {
          gp_id: string
          id?: string
          is_active?: boolean
          name_en: string
          name_mr: string
          phone?: string | null
          photo_url?: string | null
          post_en: string
          post_mr: string
          sort_order?: number
        }
        Update: {
          gp_id?: string
          id?: string
          is_active?: boolean
          name_en?: string
          name_mr?: string
          phone?: string | null
          photo_url?: string | null
          post_en?: string
          post_mr?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_holders_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "gp_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Update: infer U } ? U : never
