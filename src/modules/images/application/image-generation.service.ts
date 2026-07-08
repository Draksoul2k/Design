import { getOpenAIImageModel } from '@/lib/env'
import type { GeneratedLogoDraft } from '@/modules/logos/domain/logo'
import type { PromptPipelineSnapshot } from '@/modules/prompts/domain/prompt'
import type { ImageProvider } from '@/modules/images/domain/image-provider'

function assertApprovedPromptTracks(snapshot: PromptPipelineSnapshot) {
  const approved = snapshot.items.filter((item) => item.prompt.status === 'approved')

  if (approved.length !== 3) {
    throw new Error('Chỉ được tạo logo khi có đúng 3 prompt đã approved.')
  }

  const styles = approved.map((item) => item.prompt.styleKey)
  const unique = new Set(styles)

  if (unique.size !== 3 || !unique.has('minimal') || !unique.has('luxury') || !unique.has('creative')) {
    throw new Error('Prompt approved phải gồm đúng bộ style minimal, luxury, creative.')
  }

  return approved
}

function buildLogoPrompt(promptText: string, title: string, styleKey: string) {
  return [
    `Generate a professional logo for the following approved prompt:`,
    title,
    `Style key: ${styleKey}.`,
    promptText,
    'Create a clean logo mark with transparent background look, high readability, and agency-grade brand presence.'
  ].join('\n')
}

export class ImageGenerationService {
  constructor(private readonly provider: ImageProvider) {}

  async generateLogos(input: {
    projectId: string
    workflowRunId: string
    prompts: PromptPipelineSnapshot
    model?: string
  }): Promise<{ items: GeneratedLogoDraft[] }> {
    const approvedPrompts = assertApprovedPromptTracks(input.prompts)
    const model = input.model ?? getOpenAIImageModel() ?? 'gpt-image-1'

    const results: GeneratedLogoDraft[] = []

    for (const item of approvedPrompts) {
      if (!item.latestVersion || !item.latestVersion.promptText.trim()) {
        throw new Error(`Approved prompt ${item.prompt.styleKey} is missing a version prompt text.`)
      }

      if (!item.latestVersion.id) {
        throw new Error(`Approved prompt ${item.prompt.styleKey} is missing a prompt version id.`)
      }

      const startedAt = new Date()
      const requestPrompt = buildLogoPrompt(
        item.latestVersion.promptText,
        item.prompt.title,
        item.prompt.styleKey
      )
      const imageResult = await this.provider.generateImage({
        prompt: requestPrompt,
        model,
        size: '1024x1024',
        style: 'vivid'
      })
      const finishedAt = new Date()

      results.push({
        projectId: input.projectId,
        workflowRunId: input.workflowRunId,
        promptId: item.prompt.id,
        promptVersionId: item.latestVersion.id,
        promptVersion: item.latestVersion.version,
        styleKey: item.prompt.styleKey,
        title: item.prompt.title,
        provider: imageResult.provider,
        model: imageResult.model,
        status: 'completed',
        generationInputJson: {
          prompt: requestPrompt,
          sourcePromptId: item.prompt.id,
          sourcePromptVersionId: item.latestVersion?.id ?? null
        },
        generationOutputJson: imageResult,
        errorJson: null,
        startedAt,
        finishedAt,
        asset: {
          kind: 'primary',
          mimeType: imageResult.mimeType,
          dataUrl: imageResult.dataUrl,
          sourceUrl: imageResult.sourceUrl,
          width: 1024,
          height: 1024
        }
      })
    }

    return { items: results }
  }
}
