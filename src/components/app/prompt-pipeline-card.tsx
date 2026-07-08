import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PromptPipelineSnapshot } from '@/modules/prompts/domain/prompt'

function getStatusVariant(status: string) {
  switch (status) {
    case 'published':
    case 'approved':
      return 'default' as const
    case 'reviewing':
      return 'secondary' as const
    case 'rejected':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return '—'
  }

  return `${score}/10`
}

function summarizePromptText(promptText: string) {
  const compact = promptText.replace(/\s+/g, ' ').trim()

  if (compact.length <= 140) {
    return compact
  }

  return `${compact.slice(0, 140)}...`
}

export function PromptPipelineCard({ pipeline }: { pipeline: PromptPipelineSnapshot }) {
  if (pipeline.items.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Prompt Pipeline</CardTitle>
          <CardDescription>No prompts have been stored yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Prompt Pipeline</CardTitle>
        <CardDescription>Three prompt tracks with version history, review status, and scoring.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {pipeline.items.map((item) => {
          const latest = item.latestVersion

          return (
            <div key={item.prompt.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.prompt.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.prompt.styleKey} · Prompt ID {item.prompt.id}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.prompt.status)}>{item.prompt.status}</Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Version</p>
                  <p className="mt-1 font-medium">v{item.prompt.currentVersion}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest Score</p>
                  <p className="mt-1 font-medium">{formatScore(item.prompt.latestScore)}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {latest ? summarizePromptText(latest.promptText) : 'No version stored yet.'}
              </p>

              {latest ? (
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>Latest version: {latest.version}</p>
                  <p>Review status: {latest.status}</p>
                </div>
              ) : null}

              {item.versions.length > 1 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.versions.map((version) => (
                    <Badge key={version.id} variant="outline" className="text-[11px]">
                      v{version.version}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

