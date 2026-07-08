export const PROMPT_STYLE_KEYS = ['minimal', 'luxury', 'creative'] as const

export type PromptStyleKey = (typeof PROMPT_STYLE_KEYS)[number]

export const PROMPT_STATUS_KEYS = ['draft', 'reviewing', 'approved', 'rejected', 'published'] as const

export type PromptStatus = (typeof PROMPT_STATUS_KEYS)[number]

export type PromptTrackRecord = {
  id: string
  projectId: string
  styleKey: PromptStyleKey
  title: string
  status: PromptStatus
  currentVersion: number
  latestScore: number | null
  latestPromptVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

export type PromptVersionRecord = {
  id: string
  promptId: string
  workflowRunId: string
  version: number
  status: PromptStatus
  promptText: string
  generatedJson: unknown
  reviewJson: unknown
  scoreJson: unknown
  score: number | null
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PromptPipelineItem = {
  prompt: PromptTrackRecord
  latestVersion: PromptVersionRecord | null
  versions: PromptVersionRecord[]
}

export type PromptPipelineSnapshot = {
  items: PromptPipelineItem[]
}

