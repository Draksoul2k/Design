import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LogoCraft AI
        </Link>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/sign-in">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Tạo tài khoản</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

