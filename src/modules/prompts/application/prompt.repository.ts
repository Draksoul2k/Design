import type {
  PromptPipelineSnapshot,
  PromptStatus,
  PromptStyleKey,
  PromptTrackRecord,
  PromptVersionRecord
} from '@/modules/prompts/domain/prompt'

export type PromptVersionInput = {
  projectId: string
  workflowRunId: string
  styleKey: PromptStyleKey
  title: string
  promptText: string
  generatedJson: unknown
  reviewJson: unknown
  scoreJson: unknown
  status: PromptStatus
  score: number | null
  approvedAt?: Date | null
}

export interface PromptRepository {
  storePromptVersion(input: PromptVersionInput): Promise<{
    prompt: PromptTrackRecord
    version: PromptVersionRecord
  }>
  storePromptVersions(
    inputs: PromptVersionInput[]
  ): Promise<Array<{
    prompt: PromptTrackRecord
    version: PromptVersionRecord
  }>>
  listByProjectId(projectId: string): Promise<PromptPipelineSnapshot>
}

