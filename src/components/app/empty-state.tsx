import Link from 'next/link'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaHref ? (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

