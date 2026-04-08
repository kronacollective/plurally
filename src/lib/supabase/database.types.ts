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
          is_public: boolean
          name: string
        }
        Insert: {
          account: string
          color?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
        }
        Update: {
          account?: string
          color?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
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
      journal: {
        Row: {
          account: string
          content: string
          created_at: string
          id: string
          is_public: boolean
          member: string
          title: string | null
        }
        Insert: {
          account: string
          content: string
          created_at?: string
          id?: string
          is_public?: boolean
          member: string
          title?: string | null
        }
        Update: {
          account?: string
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean
          member?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_member_fkey"
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
          username: string | null
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
          username?: string | null
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
          username?: string | null
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
      notifications: {
        Row: {
          account: string
          body: string | null
          created_at: string
          id: string
          title: string | null
        }
        Insert: {
          account: string
          body?: string | null
          created_at?: string
          id?: string
          title?: string | null
        }
        Update: {
          account?: string
          body?: string | null
          created_at?: string
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          description: string | null
          id: string
          is_abstain: boolean
          is_veto: boolean
          name: string | null
          poll: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_abstain?: boolean
          is_veto?: boolean
          name?: string | null
          poll: string
        }
        Update: {
          description?: string | null
          id?: string
          is_abstain?: boolean
          is_veto?: boolean
          name?: string | null
          poll?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_fkey"
            columns: ["poll"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          member: string | null
          option: string | null
          poll: string | null
        }
        Insert: {
          id?: string
          member?: string | null
          option?: string | null
          poll?: string | null
        }
        Update: {
          id?: string
          member?: string | null
          option?: string | null
          poll?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_option_fkey"
            columns: ["option"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_fkey"
            columns: ["poll"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          account: string | null
          can_abstain: boolean | null
          can_veto: boolean | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_multi: boolean | null
          name: string | null
        }
        Insert: {
          account?: string | null
          can_abstain?: boolean | null
          can_veto?: boolean | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_multi?: boolean | null
          name?: string | null
        }
        Update: {
          account?: string | null
          can_abstain?: boolean | null
          can_veto?: boolean | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_multi?: boolean | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          directional: boolean
          id: string
          label: string | null
          origin_arbitrary: string | null
          origin_label: string | null
          origin_member: string | null
          origin_type: string | null
          target_arbitrary: string | null
          target_label: string | null
          target_member: string | null
          target_type: string | null
          type: string | null
        }
        Insert: {
          directional?: boolean
          id?: string
          label?: string | null
          origin_arbitrary?: string | null
          origin_label?: string | null
          origin_member?: string | null
          origin_type?: string | null
          target_arbitrary?: string | null
          target_label?: string | null
          target_member?: string | null
          target_type?: string | null
          type?: string | null
        }
        Update: {
          directional?: boolean
          id?: string
          label?: string | null
          origin_arbitrary?: string | null
          origin_label?: string | null
          origin_member?: string | null
          origin_type?: string | null
          target_arbitrary?: string | null
          target_label?: string | null
          target_member?: string | null
          target_type?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationships_origin_member_fkey"
            columns: ["origin_member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_target_member_fkey"
            columns: ["target_member"]
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
