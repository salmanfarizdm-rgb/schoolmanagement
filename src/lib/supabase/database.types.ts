export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      absence_notifications: {
        Row: { attendance_id: number; created_at: string; id: number; parent_id: string | null; student_id: string; whatsapp_number: string | null; whatsapp_sent_at: string | null }
        Insert: { attendance_id: number; created_at?: string; id?: number; parent_id?: string | null; student_id: string; whatsapp_number?: string | null; whatsapp_sent_at?: string | null }
        Update: { attendance_id?: number; created_at?: string; id?: number; parent_id?: string | null; student_id?: string; whatsapp_number?: string | null; whatsapp_sent_at?: string | null }
        Relationships: []
      }
      announcements: {
        Row: { body: string; created_at: string; created_by: string | null; id: number; title: string }
        Insert: { body: string; created_at?: string; created_by?: string | null; id?: number; title: string }
        Update: { body?: string; created_at?: string; created_by?: string | null; id?: number; title?: string }
        Relationships: []
      }
      attendance: {
        Row: { arrival_time: string | null; created_at: string; date: string; id: number; marked_by: string | null; period: Database["public"]["Enums"]["attendance_period"]; reason: string | null; status: Database["public"]["Enums"]["attendance_status"]; student_id: string }
        Insert: { arrival_time?: string | null; created_at?: string; date: string; id?: number; marked_by?: string | null; period: Database["public"]["Enums"]["attendance_period"]; reason?: string | null; status: Database["public"]["Enums"]["attendance_status"]; student_id: string }
        Update: { arrival_time?: string | null; created_at?: string; date?: string; id?: number; marked_by?: string | null; period?: Database["public"]["Enums"]["attendance_period"]; reason?: string | null; status?: Database["public"]["Enums"]["attendance_status"]; student_id?: string }
        Relationships: []
      }
      calendar: {
        Row: { date: string; label: string | null; type: Database["public"]["Enums"]["calendar_day_type"] }
        Insert: { date: string; label?: string | null; type?: Database["public"]["Enums"]["calendar_day_type"] }
        Update: { date?: string; label?: string | null; type?: Database["public"]["Enums"]["calendar_day_type"] }
        Relationships: []
      }
      exam_marks: {
        Row: { created_at: string; exam_id: number; id: number; marks_obtained: number | null; remarks: string | null; student_id: string }
        Insert: { created_at?: string; exam_id: number; id?: number; marks_obtained?: number | null; remarks?: string | null; student_id: string }
        Update: { created_at?: string; exam_id?: number; id?: number; marks_obtained?: number | null; remarks?: string | null; student_id?: string }
        Relationships: []
      }
      exams: {
        Row: { created_at: string; date: string; id: number; max_marks: number; subject: string; time: string | null }
        Insert: { created_at?: string; date: string; id?: number; max_marks?: number; subject: string; time?: string | null }
        Update: { created_at?: string; date?: string; id?: number; max_marks?: number; subject?: string; time?: string | null }
        Relationships: []
      }
      leave_requests: {
        Row: { created_at: string; from_date: string; id: number; note: string | null; parent_id: string; reason: string; reviewed_at: string | null; reviewed_by: string | null; status: string; student_id: string; teacher_note: string | null; to_date: string }
        Insert: { created_at?: string; from_date: string; id?: number; note?: string | null; parent_id: string; reason: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; student_id: string; teacher_note?: string | null; to_date: string }
        Update: { created_at?: string; from_date?: string; id?: number; note?: string | null; parent_id?: string; reason?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; student_id?: string; teacher_note?: string | null; to_date?: string }
        Relationships: []
      }
      parents: {
        Row: { created_at: string; id: string; secondary_contact: string | null; student_id: string; whatsapp_number: string | null }
        Insert: { created_at?: string; id: string; secondary_contact?: string | null; student_id: string; whatsapp_number?: string | null }
        Update: { created_at?: string; id?: string; secondary_contact?: string | null; student_id?: string; whatsapp_number?: string | null }
        Relationships: []
      }
      profiles: {
        Row: { created_at: string; id: string; role: string }
        Insert: { created_at?: string; id: string; role: string }
        Update: { created_at?: string; id?: string; role?: string }
        Relationships: []
      }
      remark_replies: {
        Row: { author_id: string | null; author_role: string; created_at: string; id: number; message: string; remark_id: number }
        Insert: { author_id?: string | null; author_role: string; created_at?: string; id?: number; message: string; remark_id: number }
        Update: { author_id?: string | null; author_role?: string; created_at?: string; id?: number; message?: string; remark_id?: number }
        Relationships: []
      }
      remarks: {
        Row: { created_at: string; created_by: string | null; description: string; id: number; severity: string; student_id: string }
        Insert: { created_at?: string; created_by?: string | null; description: string; id?: number; severity: string; student_id: string }
        Update: { created_at?: string; created_by?: string | null; description?: string; id?: number; severity?: string; student_id?: string }
        Relationships: []
      }
      settings: {
        Row: { key: string; value: string }
        Insert: { key: string; value: string }
        Update: { key?: string; value?: string }
        Relationships: []
      }
      special_class_confirmations: {
        Row: { confirmed_at: string; id: number; parent_id: string; special_class_id: number }
        Insert: { confirmed_at?: string; id?: number; parent_id: string; special_class_id: number }
        Update: { confirmed_at?: string; id?: number; parent_id?: string; special_class_id?: number }
        Relationships: []
      }
      special_classes: {
        Row: { created_at: string; date: string; id: number; subject: string; time: string }
        Insert: { created_at?: string; date: string; id?: number; subject: string; time: string }
        Update: { created_at?: string; date?: string; id?: number; subject?: string; time?: string }
        Relationships: []
      }
      student_edit_log: {
        Row: { changed_at: string; changed_by: string | null; field: string; id: number; new_value: string | null; old_value: string | null; student_id: string }
        Insert: { changed_at?: string; changed_by?: string | null; field: string; id?: number; new_value?: string | null; old_value?: string | null; student_id: string }
        Update: { changed_at?: string; changed_by?: string | null; field?: string; id?: number; new_value?: string | null; old_value?: string | null; student_id?: string }
        Relationships: []
      }
      students: {
        Row: { created_at: string; gender: string; id: string; name: string; status: Database["public"]["Enums"]["student_status"] }
        Insert: { created_at?: string; gender: string; id: string; name: string; status?: Database["public"]["Enums"]["student_status"] }
        Update: { created_at?: string; gender?: string; id?: string; name?: string; status?: Database["public"]["Enums"]["student_status"] }
        Relationships: []
      }
      timetable: {
        Row: { day_of_week: number; id: number; period_number: number; subject: string }
        Insert: { day_of_week: number; id?: number; period_number: number; subject: string }
        Update: { day_of_week?: number; id?: number; period_number?: number; subject?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      generate_sunday_calendar: { Args: { p_end: string; p_start: string }; Returns: number }
      is_teacher: { Args: never; Returns: boolean }
      my_student_id: { Args: never; Returns: string }
    }
    Enums: {
      attendance_period: "morning" | "afternoon"
      attendance_status: "Present" | "Absent" | "Leave" | "Late" | "Half-day"
      calendar_day_type: "normal" | "public_holiday" | "special_working"
      student_status: "active" | "inactive"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]
