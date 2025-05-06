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
      children: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string
          student_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id: string
          student_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string
          student_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          activation_code: string
          child_name: string | null
          created_at: string | null
          created_by: string
          email: string | null
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          student_number: string | null
          used: boolean | null
          used_by: string | null
        }
        Insert: {
          activation_code: string
          child_name?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          student_number?: string | null
          used?: boolean | null
          used_by?: string | null
        }
        Update: {
          activation_code?: string
          child_name?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          student_number?: string | null
          used?: boolean | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          direction: number | null
          driver_id: string
          id: string
          latitude: number
          longitude: number
          speed: number
          timestamp: string
          vehicle_id: string
        }
        Insert: {
          direction?: number | null
          driver_id: string
          id?: string
          latitude: number
          longitude: number
          speed?: number
          timestamp?: string
          vehicle_id: string
        }
        Update: {
          direction?: number | null
          driver_id?: string
          id?: string
          latitude?: number
          longitude?: number
          speed?: number
          timestamp?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          description: string | null
          driver_id: string | null
          end_location: string
          id: string
          name: string
          start_location: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          end_location: string
          id?: string
          name: string
          start_location: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          end_location?: string
          id?: string
          name?: string
          start_location?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          arrival_time: string
          created_at: string
          day_of_week: number
          departure_time: string
          id: string
          route_id: string | null
          stop_id: string | null
          updated_at: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          day_of_week: number
          departure_time: string
          id?: string
          route_id?: string | null
          stop_id?: string | null
          updated_at?: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          day_of_week?: number
          departure_time?: string
          id?: string
          route_id?: string | null
          stop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stops: {
        Row: {
          address: string
          estimated_time: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          route_id: string | null
          sequence_number: number
        }
        Insert: {
          address: string
          estimated_time?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          route_id?: string | null
          sequence_number: number
        }
        Update: {
          address?: string
          estimated_time?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          route_id?: string | null
          sequence_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          id: string
          marked_at: string | null
          marked_by: string | null
          status: string | null
          student_id: string | null
          trip_date: string
          trip_id: string | null
        }
        Insert: {
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          status?: string | null
          student_id?: string | null
          trip_date?: string
          trip_id?: string | null
        }
        Update: {
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          status?: string | null
          student_id?: string | null
          trip_date?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          classroom: string | null
          created_at: string | null
          grade: string | null
          id: string
          name: string
          parent_id: string | null
          pickup_address: string | null
          route_id: string | null
          stop_id: string | null
        }
        Insert: {
          classroom?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          name: string
          parent_id?: string | null
          pickup_address?: string | null
          route_id?: string | null
          stop_id?: string | null
        }
        Update: {
          classroom?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          pickup_address?: string | null
          route_id?: string | null
          stop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string
          driver_id: string
          id: string
          last_latitude: number | null
          last_location_update: string | null
          last_longitude: number | null
          license_plate: string
          model: string
          status: string
          tracking_enabled: boolean
          updated_at: string
          year: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          driver_id: string
          id?: string
          last_latitude?: number | null
          last_location_update?: string | null
          last_longitude?: number | null
          license_plate: string
          model: string
          status?: string
          tracking_enabled?: boolean
          updated_at?: string
          year: string
        }
        Update: {
          capacity?: number
          created_at?: string
          driver_id?: string
          id?: string
          last_latitude?: number | null
          last_location_update?: string | null
          last_longitude?: number | null
          license_plate?: string
          model?: string
          status?: string
          tracking_enabled?: boolean
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_old_locations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "parent" | "student" | "driver" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["parent", "student", "driver", "manager"],
    },
  },
} as const
