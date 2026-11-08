import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { supabaseEnabled } from './config'

export function createClient() {
  // Offline, pages that use this are redirected away by middleware, but they are still
  // prerendered at build time, so give the client placeholder values instead of throwing.
  return createBrowserClient<Database>(
    supabaseEnabled ? process.env.NEXT_PUBLIC_SUPABASE_URL! : 'http://localhost',
    supabaseEnabled ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : 'offline'
  )
}
