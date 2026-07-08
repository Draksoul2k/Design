import { notFound } from 'next/navigation'
import { ProjectForm } from '@/modules/projects/presentation/project-form'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import { getProject } from '@/modules/projects/application/project.use-cases'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'

type EditProjectPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const project = await getProject(projectRepository, projectId, user.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ProjectForm mode="edit" projectId={project.id} defaultName={project.name} />
    </div>
  )
}

