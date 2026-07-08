import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from '@/lib/env'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabaseConfig()

  return createServerClient(url, publishableKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: unknown) {
        void name
        void value
        void options
        // Server Components cannot mutate cookies. Use Server Actions instead.
      },
      remove(name: string, options: unknown) {
        void name
        void options
        // Server Components cannot mutate cookies. Use Server Actions instead.
      }
    }
  })
}
