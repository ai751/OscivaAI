export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      user_api_keys: {
        Row: {
          user_id: string
          provider: string
          api_key: string
          updated_at: string
        }
        Insert: {
          user_id: string
          provider: string
          api_key: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          provider?: string
          api_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          agent_id: string
          user_id: string
          message_count: number
          started_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id: string
          message_count?: number
          started_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string
          message_count?: number
          started_at?: string
          last_message_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          agent_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          agent_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          agent_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_chunks: {
        Row: {
          agent_id: string
          chunk_index: number
          content: string
          created_at: string
          id: string
          source_id: string
        }
        Insert: {
          agent_id: string
          chunk_index?: number
          content: string
          created_at?: string
          id?: string
          source_id: string
        }
        Update: {
          agent_id?: string
          chunk_index?: number
          content?: string
          created_at?: string
          id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_chunks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "agent_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_sources: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          name: string
          raw_text: string | null
          size: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          name: string
          raw_text?: string | null
          size?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          name?: string
          raw_text?: string | null
          size?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_sources_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_access: {
        Row: {
          agent_id: string
          password_hash: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          password_hash?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          password_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_access_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          active: boolean
          chat_icon: string
          color: string
          conversation_count: number
          created_at: string
          domains: string[]
          id: string
          instructions: string
          message_count: number
          model: string
          name: string
          password_enabled: boolean
          personality: string
          position: string
          rate_limit_enabled: boolean
          rate_limit_per_hour: number
          suggestions: string[]
          updated_at: string
          user_id: string
          welcome_msg: string
          logo_url: string | null
        }
        Insert: {
          active?: boolean
          chat_icon?: string
          color?: string
          conversation_count?: number
          created_at?: string
          domains?: string[]
          id?: string
          instructions?: string
          message_count?: number
          model?: string
          name?: string
          password_enabled?: boolean
          personality?: string
          position?: string
          rate_limit_enabled?: boolean
          rate_limit_per_hour?: number
          suggestions?: string[]
          updated_at?: string
          user_id: string
          welcome_msg?: string
          logo_url?: string | null
        }
        Update: {
          active?: boolean
          chat_icon?: string
          color?: string
          conversation_count?: number
          created_at?: string
          domains?: string[]
          id?: string
          instructions?: string
          message_count?: number
          model?: string
          name?: string
          password_enabled?: boolean
          personality?: string
          position?: string
          rate_limit_enabled?: boolean
          rate_limit_per_hour?: number
          suggestions?: string[]
          updated_at?: string
          user_id?: string
          welcome_msg?: string
          logo_url?: string | null
        }
        Relationships: []
      }
      monthly_usage: {
        Row: {
          user_id: string
          month: string
          msgs: number
        }
        Insert: {
          user_id: string
          month: string
          msgs?: number
        }
        Update: {
          user_id?: string
          month?: string
          msgs?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          agent_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          title: string
          body?: string | null
          agent_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          agent_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          message_count: number
          stat_date: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          message_count?: number
          stat_date?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          message_count?: number
          stat_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan?: string
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
