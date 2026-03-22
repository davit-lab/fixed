import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[v0] Supabase environment variables not found. Auth will not work.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'owner' | 'renter' | 'admin'
  phone: string | null
  created_at: string
  updated_at: string
}

export type Equipment = {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  location: string | null
  lat: number | null
  lng: number | null
  image_url: string | null
  category: string | null
  rating: number
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  user_id: string
  type: 'cargo' | 'route'
  title: string
  description: string | null
  price: number | null
  weight: number | null
  origin_address: string | null
  origin_lat: number | null
  origin_lng: number | null
  destination_address: string | null
  destination_lat: number | null
  destination_lng: number | null
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  equipment_id: string
  user_id: string
  owner_id: string
  start_date: string
  end_date: string
  total_price: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export type Review = {
  id: string
  equipment_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type Category = {
  id: string
  name: string
  name_ka: string | null
  name_ru: string | null
  icon: string | null
  created_at: string
}
