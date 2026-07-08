/* eslint-disable @next/next/no-img-element */
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { LogoPipelineSnapshot } from '@/modules/logos/domain/logo'

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default' as const
    case 'generating':
      return 'secondary' as const
    case 'failed':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function getAssetSource(asset: { dataUrl: string | null; sourceUrl: string | null } | null) {
  if (!asset) {
    return null
  }

  return asset.dataUrl ?? asset.sourceUrl ?? null
}

export function LogoPipelineCard({ pipeline }: { pipeline: LogoPipelineSnapshot }) {
  if (pipeline.items.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Logo Pipeline</CardTitle>
          <CardDescription>No logos have been generated yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Logo Pipeline</CardTitle>
        <CardDescription>Generated logos with their stored assets and metadata.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {pipeline.items.map((item) => (
          <div key={item.logo.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{item.logo.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.logo.styleKey} · Prompt {item.logo.promptVersionId}
                </p>
              </div>
              <Badge variant={getStatusVariant(item.logo.status)}>{item.logo.status}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Provider: {item.logo.provider}</p>
              <p>Model: {item.logo.model}</p>
              <p>Asset: {item.asset ? item.asset.kind : 'missing'}</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-muted/20">
              {getAssetSource(item.asset) ? (
                <img
                  src={getAssetSource(item.asset) ?? undefined}
                  alt={item.logo.title}
                  className="h-44 w-full object-contain bg-background"
                />
              ) : (
                <div className="flex h-44 items-center justify-center px-4 text-sm text-muted-foreground">
                  Missing Asset
                </div>
              )}
            </div>

            {item.asset ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                <p>Mime: {item.asset.mimeType}</p>
                <p>
                  Size: {item.asset.width ?? 'unknown'} x {item.asset.height ?? 'unknown'}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
