'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword
} from '@/modules/auth/application/auth.service'

export type AuthActionState = {
  status: 'idle' | 'error'
  message: string
}

const initialState: AuthActionState = {
  status: 'idle',
  message: ''
}

function normalizeEmail(formData: FormData) {
  return String(formData.get('email') ?? '').trim().toLowerCase()
}

function normalizePassword(formData: FormData) {
  return String(formData.get('password') ?? '')
}

export async function signInAction(
  _state: AuthActionState = initialState,
  formData: FormData
): Promise<AuthActionState> {
  void _state

  const email = normalizeEmail(formData)
  const password = normalizePassword(formData)

  if (!email || !password) {
    return {
      status: 'error',
      message: 'Vui lòng nhập email và mật khẩu.'
    }
  }

  const { error } = await signInWithEmailPassword({ email, password })

  if (error) {
    return {
      status: 'error',
      message: error.message
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signUpAction(
  _state: AuthActionState = initialState,
  formData: FormData
): Promise<AuthActionState> {
  void _state

  const email = normalizeEmail(formData)
  const password = normalizePassword(formData)

  if (!email || !password) {
    return {
      status: 'error',
      message: 'Vui lòng nhập email và mật khẩu.'
    }
  }

  const { error } = await signUpWithEmailPassword({ email, password })

  if (error) {
    return {
      status: 'error',
      message: error.message
    }
  }

  redirect('/sign-in?registered=1')
}

export async function signOutAction() {
  await signOut()
  revalidatePath('/')
  redirect('/sign-in')
}
