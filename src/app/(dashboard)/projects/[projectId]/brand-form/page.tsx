import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import { getBrandFormWorkspace, getInitialBrandFormValues } from '@/modules/brand-form/application/brand-form.use-cases'
import { brandFormRepository } from '@/modules/brand-form/infrastructure/prisma-brand-form.repository'
import { BrandFormWizard } from '@/modules/brand-form/presentation/brand-form-wizard'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'

type BrandFormPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function BrandFormPage({ params }: BrandFormPageProps) {
  const { projectId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const workspace = await getBrandFormWorkspace(
    projectRepository,
    brandFormRepository,
    projectId,
    user.id
  )

  if (!workspace.project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Brand Form</CardTitle>
          <CardDescription>
            Complete the brief step by step. Your progress is autosaved and can be resumed later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandFormWizard
            projectId={projectId}
            projectName={workspace.project.name}
            initialValues={getInitialBrandFormValues(workspace.draft)}
            initialStep={workspace.draft?.currentStep}
            initialStatus={workspace.draft?.status}
            initialSummary={workspace.draft?.aiSummary}
          />
        </CardContent>
      </Card>
    </div>
  )
}

