import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/app/dashboard-shell'
import { getCurrentUser } from '@/modules/auth/application/auth.service'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <DashboardShell>{children}</DashboardShell>
}

