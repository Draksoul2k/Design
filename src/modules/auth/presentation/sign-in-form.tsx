'use client'

import { useActionState } from 'react'
import { Loader2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuthActionState } from '@/modules/auth/presentation/auth.actions'
import { signInAction } from '@/modules/auth/presentation/auth.actions'

const initialState: AuthActionState = {
  status: 'idle',
  message: ''
}

export function SignInForm({ registered }: { registered?: boolean }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState)

  return (
    <Card className="border-border/60 bg-card/90 shadow-soft backdrop-blur">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>
          Truy cập dashboard và quản lý project branding của bạn.
        </CardDescription>
        {registered ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@company.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" />
            </div>
          </div>
          {state.message ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

