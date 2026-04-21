// Auto-generated from live Supabase schema. Do not edit manually.
// Regenerate: use Supabase MCP tool `generate_typescript_types`
// or: supabase gen types typescript --project-id kntraxcpflpptmtlqqvv > lib/supabase/types.ts

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
          gp_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          gp_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          gp_id?: string
          id?: string
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
          id: string
          logo_url: string | null
          name_en: string
          name_mr: string
          subdomain: string
          village: Json | null
        }
        Insert: {
          contact?: Json | null
          created_at?: string
          established?: string | null
          id?: string
          logo_url?: string | null
          name_en: string
          name_mr: string
          subdomain: string
          village?: Json | null
        }
        Update: {
          contact?: Json | null
          created_at?: string
          established?: string | null
          id?: string
          logo_url?: string | null
          name_en?: string
          name_mr?: string
          subdomain?: string
          village?: Json | null
        }
        Relationships: []
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
