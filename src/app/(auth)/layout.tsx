import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_22%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_0.85fr]">
          <div className="hidden space-y-6 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
              LogoCraft AI
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight">
              One workspace for agency-grade logo creation.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Sign in to manage projects, track versions and prepare the foundation for the
              branding workflow.
            </p>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

