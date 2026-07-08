import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WORKFLOW_STEP_LABELS } from '@/modules/workflow/domain/workflow'
import type { WorkflowTimeline } from '@/modules/workflow/domain/workflow'

function getStatusLabel(status: string) {
  switch (status) {
    case 'running':
      return 'Running'
    case 'success':
      return 'Success'
    case 'failed':
      return 'Failed'
    default:
      return 'Pending'
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'running':
      return 'secondary' as const
    case 'success':
      return 'default' as const
    case 'failed':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function summarizeOutput(outputJson: unknown): string {
  if (!outputJson || typeof outputJson !== 'object') {
    return 'No output yet.'
  }

  const value = outputJson as Record<string, unknown>
  if (typeof value.summary === 'string') {
    return value.summary
  }

  if (Array.isArray(value.prompts)) {
    return `${value.prompts.length} prompt record(s) saved.`
  }

  if (Array.isArray(value.logos)) {
    return `${value.logos.length} logo record(s) saved.`
  }

  return 'Structured JSON output saved.'
}

export function WorkflowTimelineCard({ timeline }: { timeline: WorkflowTimeline }) {
  if (!timeline.run) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Workflow Timeline</CardTitle>
          <CardDescription>No workflow has been started yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Workflow Timeline</CardTitle>
        <CardDescription>
          Latest run status: {getStatusLabel(timeline.run.status)} · Source: {timeline.run.source}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Run Status</p>
            <Badge variant={getStatusVariant(timeline.run.status)} className="mt-2">
              {getStatusLabel(timeline.run.status)}
            </Badge>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Step</p>
            <p className="mt-2 font-medium">
              {WORKFLOW_STEP_LABELS[timeline.run.currentStep] ?? timeline.run.currentStep}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Started At</p>
            <p className="mt-2 font-medium">
              {timeline.run.startedAt ? timeline.run.startedAt.toLocaleString('vi-VN') : '—'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {timeline.steps.map((step) => (
            <div key={step.roleKey} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{step.roleLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    Step {step.stepOrder} · {step.roleKey}
                  </p>
                </div>
                <Badge variant={getStatusVariant(step.status)}>{getStatusLabel(step.status)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{summarizeOutput(step.outputJson)}</p>
              {step.errorJson ? (
                <p className="mt-2 text-sm text-destructive">
                  {typeof step.errorJson === 'object' && step.errorJson && 'message' in step.errorJson
                    ? String((step.errorJson as Record<string, unknown>).message)
                    : 'Workflow step failed.'}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
