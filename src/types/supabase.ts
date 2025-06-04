export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          name: string | null
          role: string | null
          user_role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          name?: string | null
          role?: string | null
          user_role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          name?: string | null
          role?: string | null
          user_role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participants: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participants: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participants?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          sender_id: string
          sender_name: string
          sender_role: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          sender_id: string
          sender_name: string
          sender_role: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          created_at?: string
        }
      }
      trip_history: {
        Row: {
          id: string
          route_id: string
          vehicle_id: string
          start_time: string
          end_time: string
          completed_stops: number
          total_stops: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          vehicle_id: string
          start_time: string
          end_time: string
          completed_stops?: number
          total_stops?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          vehicle_id?: string
          start_time?: string
          end_time?: string
          completed_stops?: number
          total_stops?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_history_route_id_fkey"
            columns: ["route_id"]
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other tables ...
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
  }
} 