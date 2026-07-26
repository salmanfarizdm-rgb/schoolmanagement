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
      absence_notifications: {
        Row: {
          attendance_id: number
          created_at: string
          id: number
          parent_id: string | null
          student_id: string
          whatsapp_number: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          attendance_id: number
          created_at?: string
          id?: number
          parent_id?: string | null
          student_id: string
          whatsapp_number?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          attendance_id?: number
          created_at?: string
          id?: number
          parent_id?: string | null
          student_id?: string
          whatsapp_number?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absence_notifications_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: true
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          arrival_time: string | null
          created_at: string
          date: string
          id: number
          marked_by: string | null
          period: Database["public"]["Enums"]["attendance_period"]
          reason: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string
          date: string
          id?: number
          marked_by?: string | null
          period: Database["public"]["Enums"]["attendance_period"]
          reason?: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string
          date?: string
          id?: number
          marked_by?: string | null
          period?: Database["public"]["Enums"]["attendance_period"]
          reason?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar: {
        Row: {
          date: string
          type: Database["public"]["Enums"]["calendar_day_type"]
        }
        Insert: {
          date: string
          type?: Database["public"]["Enums"]["calendar_day_type"]
        }
        Update: {
          date?: string
          type?: Database["public"]["Enums"]["calendar_day_type"]
        }
        Relationships: []
      }
      parents: {
        Row: {
          created_at: string
          id: string
          secondary_contact: string | null
          student_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id: string
          secondary_contact?: string | null
          student_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          secondary_contact?: string | null
          student_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      special_class_confirmations: {
        Row: {
          confirmed_at: string
          id: number
          parent_id: string
          special_class_id: number
        }
        Insert: {
          confirmed_at?: string
          id?: number
          parent_id: string
          special_class_id: number
        }
        Update: {
          confirmed_at?: string
          id?: number
          parent_id?: string
          special_class_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "special_class_confirmations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_class_confirmations_special_class_id_fkey"
            columns: ["special_class_id"]
            isOneToOne: false
            referencedRelation: "special_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_classes: {
        Row: {
          created_at: string
          date: string
          id: number
          subject: string
          time: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: number
          subject: string
          time: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          subject?: string
          time?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          gender: string
          id: string
          name: string
          status: Database["public"]["Enums"]["student_status"]
        }
        Insert: {
          created_at?: string
          gender: string
          id: string
          name: string
          status?: Database["public"]["Enums"]["student_status"]
        }
        Update: {
          created_at?: string
          gender?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["student_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_teacher: { Args: never; Returns: boolean }
      my_student_id: { Args: never; Returns: string }
    }
    Enums: {
      attendance_period: "morning" | "afternoon"
      attendance_status: "Present" | "Absent" | "Leave" | "Late" | "Half-day"
      calendar_day_type: "normal" | "public_holiday" | "special_working"
      student_status: "active" | "inactive"
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
    Enums: {
      attendance_period: ["morning", "afternoon"],
      attendance_status: ["Present", "Absent", "Leave", "Late", "Half-day"],
      calendar_day_type: ["normal", "public_holiday", "special_working"],
      student_status: ["active", "inactive"],
    },
  },
} as const
