import type { User } from '@supabase/supabase-js'
import { createSupabaseActionClient } from '@/lib/supabase/action'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user
}

export async function signInWithEmailPassword(params: {
  email: string
  password: string
}) {
  const supabase = await createSupabaseActionClient()
  return supabase.auth.signInWithPassword(params)
}

export async function signUpWithEmailPassword(params: {
  email: string
  password: string
}) {
  const supabase = await createSupabaseActionClient()
  return supabase.auth.signUp(params)
}

export async function signOut() {
  const supabase = await createSupabaseActionClient()
  return supabase.auth.signOut()
}

