import { ProjectForm } from '@/modules/projects/presentation/project-form'

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ProjectForm mode="create" />
    </div>
  )
}

