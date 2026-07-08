import Link from 'next/link'
import { ArrowRight, CheckCircle2, PenTool, Sparkles, WandSparkles } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SiteHeader } from '@/components/app/site-header'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const highlights = [
  {
    title: 'Brand-first workflow',
    description: 'Bắt đầu từ brief, direction và quality review thay vì sinh ảnh ngẫu nhiên.',
    icon: Sparkles
  },
  {
    title: 'Agency-style process',
    description: 'Mô phỏng cách một branding agency phân tích, sáng tạo và tinh chỉnh.',
    icon: PenTool
  },
  {
    title: 'Quality control built in',
    description: 'Mỗi output đều có thể được review, chấm điểm và lặp lại có kiểm soát.',
    icon: CheckCircle2
  }
]

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
              <WandSparkles className="h-4 w-4" />
              Agency-grade AI logo workflow
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Build a logo like you are working with a real branding agency.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                LogoCraft AI turns brand input into a structured creative process, with
                analysis, direction, prompt review, logo generation and variation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.08))] blur-3xl" />
            <Card className="overflow-hidden border-border/60 shadow-soft">
              <CardContent className="space-y-5 p-6">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow preview</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900">
                      Sprint 1
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {['Brand Form', 'Brand Brief', 'Creative Direction', 'Prompt Review', 'Logo Review'].map(
                      (step, index) => (
                        <div key={step} className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {index + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-border bg-muted/30 p-4"
                      >
                        <Icon className="mb-3 h-5 w-5 text-primary" />
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
