import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Get current user ID from Telegram or localStorage fallback (for dev)
export function getUserId() {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id) return String(tgUser.id)

  // Dev fallback: generate once and persist
  let id = localStorage.getItem('hq_dev_uid')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2)
    localStorage.setItem('hq_dev_uid', id)
  }
  return id
}
