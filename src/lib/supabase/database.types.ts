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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          sp_key: string | null
          user: string
          username: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          sp_key?: string | null
          user: string
          username: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          sp_key?: string | null
          user?: string
          username?: string
        }
        Relationships: []
      }
      bucket_fields: {
        Row: {
          bucket: string
          field: string
        }
        Insert: {
          bucket: string
          field: string
        }
        Update: {
          bucket?: string
          field?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_fields_bucket_fkey"
            columns: ["bucket"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bucket_fields_field_fkey"
            columns: ["field"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      bucket_friends: {
        Row: {
          account: string
          bucket: string
        }
        Insert: {
          account: string
          bucket: string
        }
        Update: {
          account?: string
          bucket?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_friends_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bucket_friends_bucket_fkey"
            columns: ["bucket"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      bucket_members: {
        Row: {
          bucket: string
          member: string
        }
        Insert: {
          bucket: string
          member: string
        }
        Update: {
          bucket?: string
          member?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_members_bucket_fkey"
            columns: ["bucket"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bucket_members_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      buckets: {
        Row: {
          account: string
          color: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          account: string
          color?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          account?: string
          color?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "buckets_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      field_values: {
        Row: {
          field: string
          member: string
          value: Json | null
        }
        Insert: {
          field?: string
          member: string
          value?: Json | null
        }
        Update: {
          field?: string
          member?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "field_values_field_fkey"
            columns: ["field"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_values_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          account: string
          id: string
          name: string
          type: string
        }
        Insert: {
          account: string
          id?: string
          name: string
          type?: string
        }
        Update: {
          account?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_members: {
        Row: {
          folder: string
          member: string
        }
        Insert: {
          folder: string
          member?: string
        }
        Update: {
          folder?: string
          member?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_members_folder_fkey"
            columns: ["folder"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_members_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          account: string
          color: string | null
          description: string | null
          id: string
          name: string | null
          subfolder_of: string | null
        }
        Insert: {
          account: string
          color?: string | null
          description?: string | null
          id?: string
          name?: string | null
          subfolder_of?: string | null
        }
        Update: {
          account?: string
          color?: string | null
          description?: string | null
          id?: string
          name?: string | null
          subfolder_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_subfolder_of_fkey"
            columns: ["subfolder_of"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          accepted: boolean
          related: string
          relating: string
        }
        Insert: {
          accepted: boolean
          related: string
          relating: string
        }
        Update: {
          accepted?: boolean
          related?: string
          relating?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_related_fkey"
            columns: ["related"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_relating_fkey"
            columns: ["relating"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fronts: {
        Row: {
          account: string | null
          end: string | null
          id: number
          member: string
          message: string | null
          start: string
        }
        Insert: {
          account?: string | null
          end?: string | null
          id?: number
          member: string
          message?: string | null
          start?: string
        }
        Update: {
          account?: string | null
          end?: string | null
          id?: number
          member?: string
          message?: string | null
          start?: string
        }
        Relationships: [
          {
            foreignKeyName: "fronts_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fronts_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          account: string | null
          archived: boolean
          avatar: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          is_status: boolean
          member_of: string | null
          name: string | null
          pronouns: string | null
        }
        Insert: {
          account?: string | null
          archived?: boolean
          avatar?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id: string
          is_status?: boolean
          member_of?: string | null
          name?: string | null
          pronouns?: string | null
        }
        Update: {
          account?: string | null
          archived?: boolean
          avatar?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_status?: boolean
          member_of?: string | null
          name?: string | null
          pronouns?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_member_of_fkey"
            columns: ["member_of"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account: string
          subscription: Json
        }
        Insert: {
          account: string
          subscription: Json
        }
        Update: {
          account?: string
          subscription?: Json
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_fkey"
            columns: ["account"]
            isOneToOne: true
            referencedRelation: "accounts"
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
