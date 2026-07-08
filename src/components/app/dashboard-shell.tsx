import type { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, FolderOpen, PlusCircle, LogOut, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { signOutAction } from '@/modules/auth/presentation/auth.actions'

type DashboardShellProps = {
  children: ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen }
]

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_28%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-3xl border border-border/60 bg-background/80 p-5 shadow-soft backdrop-blur lg:flex">
          <Link href="/dashboard" className="mb-8 flex items-center gap-3 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            LogoCraft AI
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className="w-full justify-start rounded-xl px-3 py-2.5 text-sm"
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <Separator />
            <Button asChild className="w-full justify-start rounded-xl">
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="w-full justify-start rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex-1">
          <div className="lg:hidden">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-soft backdrop-blur">
              <Link href="/dashboard" className="font-semibold">
                LogoCraft AI
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </form>
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/85 p-4 shadow-soft backdrop-blur sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
