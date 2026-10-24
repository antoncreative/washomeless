export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          role: 'donor' | 'sponsored' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          role?: 'donor' | 'sponsored' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: 'donor' | 'sponsored' | 'admin'
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sponsored_people: {
        Row: {
          id: string
          user_id: string | null
          name: string
          city: string
          story: string
          goal_amount: number
          current_supporters: number
          max_supporters: number
          status: 'pending' | 'active' | 'completed' | 'rejected'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          city: string
          story: string
          goal_amount?: number
          current_supporters?: number
          max_supporters?: number
          status?: 'pending' | 'active' | 'completed' | 'rejected'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          city?: string
          story?: string
          goal_amount?: number
          current_supporters?: number
          max_supporters?: number
          status?: 'pending' | 'active' | 'completed' | 'rejected'
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          person_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          amount: number
          status: 'active' | 'cancelled' | 'past_due'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number
          status?: 'active' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number
          status?: 'active' | 'cancelled' | 'past_due'
          updated_at?: string
        }
        Relationships: []
      }
      diary_updates: {
        Row: {
          id: string
          person_id: string
          title: string
          content: string
          image_url: string | null
          kind: 'text' | 'photo' | 'voice'
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          title: string
          content?: string
          image_url?: string | null
          kind?: 'text' | 'photo' | 'voice'
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          title?: string
          content?: string
          image_url?: string | null
          kind?: 'text' | 'photo' | 'voice'
          audio_url?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          id: string
          person_id: string
          title: string
          description: string | null
          completed: boolean
          completed_at: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          title: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
        SetofOptions?: undefined
      }
      update_teasers: {
        Args: { p_person_id?: string }
        Returns: {
          id: string
          person_id: string
          kind: 'text' | 'photo' | 'voice'
          title: string
          created_at: string
        }[]
        SetofOptions?: undefined
      }
    }
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type SponsoredPerson = Database['public']['Tables']['sponsored_people']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type DiaryUpdate = Database['public']['Tables']['diary_updates']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type UpdateTeaser = Database['public']['Functions']['update_teasers']['Returns'][number]
