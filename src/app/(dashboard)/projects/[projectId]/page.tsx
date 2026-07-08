import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/app/empty-state'
import { LogoPipelineCard } from '@/components/app/logo-pipeline-card'
import { PromptPipelineCard } from '@/components/app/prompt-pipeline-card'
import { WorkflowTimelineCard } from '@/components/app/workflow-timeline'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import { brandFormRepository } from '@/modules/brand-form/infrastructure/prisma-brand-form.repository'
import { getPromptPipeline } from '@/modules/prompts/application/prompt.use-cases'
import { promptRepository } from '@/modules/prompts/infrastructure/prisma-prompt.repository'
import { getProject } from '@/modules/projects/application/project.use-cases'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'
import { getLogoPipeline } from '@/modules/logos/application/logo.use-cases'
import { logoRepository } from '@/modules/logos/infrastructure/prisma-logo.repository'
import { getWorkflowTimeline } from '@/modules/workflow/application/workflow.use-cases'
import { workflowRepository } from '@/modules/workflow/infrastructure/prisma-workflow.repository'
import { runWorkflowAction } from '@/modules/workflow/presentation/workflow.actions'

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const project = await getProject(projectRepository, projectId, user.id)

  if (!project) {
    notFound()
  }

  const brandFormDraft = await brandFormRepository.findByProjectId(project.id)
  const promptPipeline = await getPromptPipeline({
    projectId: project.id,
    userId: user.id,
    projectRepository,
    promptRepository
  })
  const logoPipeline = await getLogoPipeline({
    projectId: project.id,
    userId: user.id,
    projectRepository,
    logoRepository
  })
  const workflowTimeline = await getWorkflowTimeline({
    projectId: project.id,
    userId: user.id,
    projectRepository,
    workflowRepository
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>Thông tin project, Brand Form và workflow timeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="mt-1 font-medium">{project.createdAt.toLocaleString('vi-VN')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="mt-1 font-medium">{project.updatedAt.toLocaleString('vi-VN')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Brand Form</p>
              <p className="mt-1 font-medium">
                {brandFormDraft?.status === 'completed' ? 'Completed' : 'Draft'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/projects/${project.id}/brand-form`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Brand Form
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/projects">Quay lại danh sách</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Chạy AI Workflow khi Brand Form đã được xác nhận.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandFormDraft?.status === 'completed' ? (
              <form action={runWorkflowAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <Button type="submit" className="w-full">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run Workflow
                </Button>
              </form>
            ) : (
              <EmptyState
                title="Brand Form chưa hoàn tất"
                description="Hoàn tất và xác nhận Brand Form trước khi chạy workflow AI."
                ctaLabel="Mở Brand Form"
                ctaHref={`/projects/${project.id}/brand-form`}
              />
            )}
          </CardContent>
        </Card>

        <WorkflowTimelineCard timeline={workflowTimeline} />
      </div>

      <PromptPipelineCard pipeline={promptPipeline} />

      <LogoPipelineCard pipeline={logoPipeline} />
    </div>
  )
}
