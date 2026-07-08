import type { ProjectRepository } from '@/modules/projects/application/project.repository'
import type { PromptPipelineSnapshot } from '@/modules/prompts/domain/prompt'
import type { PromptRepository } from '@/modules/prompts/application/prompt.repository'

export async function getPromptPipeline(params: {
  projectId: string
  userId: string
  projectRepository: ProjectRepository
  promptRepository: PromptRepository
}): Promise<PromptPipelineSnapshot> {
  const project = await params.projectRepository.findOwnedById(params.projectId, params.userId)

  if (!project) {
    return { items: [] }
  }

  return params.promptRepository.listByProjectId(project.id)
}

