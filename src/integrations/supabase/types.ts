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
      guides: {
        Row: {
          birthday: string | null
          created_at: string
          guide_type: Database["public"]["Enums"]["guide_type"]
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          guide_type: Database["public"]["Enums"]["guide_type"]
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birthday?: string | null
          created_at?: string
          guide_type?: Database["public"]["Enums"]["guide_type"]
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      modifications: {
        Row: {
          created_at: string
          description: string
          details: Json | null
          id: string
          status: Database["public"]["Enums"]["modification_status"]
          tour_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          details?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["modification_status"]
          tour_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          details?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["modification_status"]
          tour_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifications_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          booking_ref: string
          child_count: number | null
          count: number
          created_at: string
          group_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          booking_ref: string
          child_count?: number | null
          count: number
          created_at?: string
          group_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          booking_ref?: string
          child_count?: number | null
          count?: number
          created_at?: string
          group_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tour_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          id: string
          quantity: number
          reference: string | null
          status: string
          ticket_type: string
          tour_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          reference?: string | null
          status?: string
          ticket_type: string
          tour_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          reference?: string | null
          status?: string
          ticket_type?: string
          tour_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_groups: {
        Row: {
          child_count: number | null
          created_at: string
          entry_time: string
          guide_id: string | null
          id: string
          name: string
          size: number
          tour_id: string
          updated_at: string
        }
        Insert: {
          child_count?: number | null
          created_at?: string
          entry_time: string
          guide_id?: string | null
          id?: string
          name: string
          size: number
          tour_id: string
          updated_at?: string
        }
        Update: {
          child_count?: number | null
          created_at?: string
          entry_time?: string
          guide_id?: string | null
          id?: string
          name?: string
          size?: number
          tour_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_groups_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_groups_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          guide1_id: string | null
          guide2_id: string | null
          guide3_id: string | null
          id: string
          is_high_season: boolean | null
          location: string
          num_tickets: number | null
          reference_code: string
          start_time: string
          tour_name: string
          tour_type: Database["public"]["Enums"]["tour_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          guide1_id?: string | null
          guide2_id?: string | null
          guide3_id?: string | null
          id?: string
          is_high_season?: boolean | null
          location: string
          num_tickets?: number | null
          reference_code: string
          start_time: string
          tour_name: string
          tour_type?: Database["public"]["Enums"]["tour_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          guide1_id?: string | null
          guide2_id?: string | null
          guide3_id?: string | null
          id?: string
          is_high_season?: boolean | null
          location?: string
          num_tickets?: number | null
          reference_code?: string
          start_time?: string
          tour_name?: string
          tour_type?: Database["public"]["Enums"]["tour_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tours_guide1_id_fkey"
            columns: ["guide1_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tours_guide2_id_fkey"
            columns: ["guide2_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tours_guide3_id_fkey"
            columns: ["guide3_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      guide_type: "GA Ticket" | "GA Free" | "GC"
      modification_status: "pending" | "complete"
      tour_type: "food" | "private" | "default"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
