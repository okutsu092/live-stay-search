import { createClient } from '@supabase/supabase-js'


export function createPublicServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY


  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabaseの環境変数が設定されていません。')
  }


  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}