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
          aadhaar_number: string | null
          date_of_birth: string | null
          phone_number: string | null
          profile_photo_url: string | null
          role: 'owner' | 'tenant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          aadhaar_number?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          profile_photo_url?: string | null
          role: 'owner' | 'tenant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          aadhaar_number?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          profile_photo_url?: string | null
          role?: 'owner' | 'tenant'
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          room_number: string
          floor_number: number
          monthly_rent: number
          is_occupied: boolean
          current_tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_number: string
          floor_number: number
          monthly_rent: number
          is_occupied?: boolean
          current_tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_number?: string
          floor_number?: number
          monthly_rent?: number
          is_occupied?: boolean
          current_tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          room_id: string
          lease_start_date: string
          lease_end_date: string
          rent_due_day: number
          aadhaar_verified: boolean
          contract_signed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          room_id: string
          lease_start_date: string
          lease_end_date: string
          rent_due_day: number
          aadhaar_verified?: boolean
          contract_signed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          lease_start_date?: string
          lease_end_date?: string
          rent_due_day?: number
          aadhaar_verified?: boolean
          contract_signed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          tenant_id: string
          room_id: string
          request_type: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          room_id: string
          request_type: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          room_id?: string
          request_type?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          room_id: string
          amount: number
          payment_date: string
          payment_screenshot_url: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          room_id: string
          amount: number
          payment_date: string
          payment_screenshot_url?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          room_id?: string
          amount?: number
          payment_date?: string
          payment_screenshot_url?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      meter_readings: {
        Row: {
          id: string
          room_id: string
          reading_value: number
          reading_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          reading_value: number
          reading_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          reading_value?: number
          reading_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}