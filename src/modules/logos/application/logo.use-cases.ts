import type { ImageGenerationService } from '@/modules/images/application/image-generation.service'
import type { GeneratedLogoDraft, LogoPipelineSnapshot } from '@/modules/logos/domain/logo'
import type { LogoRepository } from '@/modules/logos/application/logo.repository'
import type { PromptPipelineSnapshot } from '@/modules/prompts/domain/prompt'
import type { ProjectRepository } from '@/modules/projects/application/project.repository'

export async function generateLogoDrafts(params: {
  projectId: string
  workflowRunId: string
  promptPipeline: PromptPipelineSnapshot
  imageGenerationService: ImageGenerationService
}): Promise<GeneratedLogoDraft[]> {
  const generated = await params.imageGenerationService.generateLogos({
    projectId: params.projectId,
    workflowRunId: params.workflowRunId,
    prompts: params.promptPipeline
  })

  return generated.items
}

export async function storeLogoDrafts(params: {
  logoRepository: LogoRepository
  items: GeneratedLogoDraft[]
}): Promise<LogoPipelineSnapshot> {
  return params.logoRepository.storeGeneratedLogos({ items: params.items })
}

export async function getLogoPipeline(params: {
  projectId: string
  userId: string
  projectRepository: ProjectRepository
  logoRepository: LogoRepository
}): Promise<LogoPipelineSnapshot> {
  const project = await params.projectRepository.findOwnedById(params.projectId, params.userId)

  if (!project) {
    return { items: [] }
  }

  return params.logoRepository.listByProjectId(project.id)
}
