import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from '@/lib/env'

export async function createSupabaseActionClient() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabaseConfig()

  return createServerClient(url, publishableKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: unknown) {
        cookieStore.set(name, value, options as never)
      },
      remove(name: string, options: unknown) {
        cookieStore.set(name, '', { ...(options as Record<string, unknown>), maxAge: 0 } as never)
      }
    }
  })
}
