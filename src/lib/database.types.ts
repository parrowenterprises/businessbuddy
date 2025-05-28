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
      users: {
        Row: {
          id: string
          email: string
          business_name: string | null
          has_completed_onboarding: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          business_name?: string | null
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string | null
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          preferred_contact: 'email' | 'phone' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          preferred_contact?: 'email' | 'phone' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          preferred_contact?: 'email' | 'phone' | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          price: number
          duration: number | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          price: number
          duration?: number | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          total_amount: number
          valid_until: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          total_amount: number
          valid_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
          total_amount?: number
          valid_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          service_id: string | null
          description: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          service_id?: string | null
          description: string
          quantity?: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          service_id?: string | null
          description?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          quote_id: string | null
          service_name: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_start: string
          scheduled_end: string
          actual_start: string | null
          actual_end: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          quote_id?: string | null
          service_name: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_start: string
          scheduled_end: string
          actual_start?: string | null
          actual_end?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          quote_id?: string | null
          service_name?: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string | null
          actual_end?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          job_id: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          amount: number
          due_date: string
          paid_date: string | null
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          job_id?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          amount: number
          due_date: string
          paid_date?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          job_id?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          amount?: number
          due_date?: string
          paid_date?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
} 