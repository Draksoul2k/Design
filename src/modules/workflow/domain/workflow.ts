import type { PromptStatus, PromptStyleKey } from '@/modules/prompts/domain/prompt'

export const WORKFLOW_ROLE_KEYS = [
  'brand_analyst',
  'knowledge_specialist',
  'creative_director',
  'prompt_designer',
  'prompt_generator',
  'prompt_reviewer',
  'prompt_scorer',
  'prompt_store',
  'logo_generate',
  'logo_store'
] as const

export type WorkflowRoleKey = (typeof WORKFLOW_ROLE_KEYS)[number]

export const WORKFLOW_STEP_LABELS: Record<WorkflowRoleKey, string> = {
  brand_analyst: 'Brand Analyst',
  knowledge_specialist: 'Knowledge Specialist',
  creative_director: 'Creative Director',
  prompt_designer: 'Prompt Designer',
  prompt_generator: 'Prompt Generator',
  prompt_reviewer: 'Prompt Reviewer',
  prompt_scorer: 'Prompt Score',
  prompt_store: 'Store Prompt',
  logo_generate: 'Generate Logo',
  logo_store: 'Store Logo'
}

export const WORKFLOW_STEP_ORDER: WorkflowRoleKey[] = [
  'brand_analyst',
  'knowledge_specialist',
  'creative_director',
  'prompt_designer',
  'prompt_generator',
  'prompt_reviewer',
  'prompt_scorer',
  'prompt_store',
  'logo_generate',
  'logo_store'
]

export const WORKFLOW_RUN_STATUSES = ['pending', 'running', 'success', 'failed'] as const
export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUSES)[number]

export const WORKFLOW_STEP_STATUSES = ['pending', 'running', 'success', 'failed'] as const
export type WorkflowStepStatus = (typeof WORKFLOW_STEP_STATUSES)[number]

export type WorkflowTimelineStep = {
  roleKey: WorkflowRoleKey
  roleLabel: string
  stepOrder: number
  status: WorkflowStepStatus
  startedAt: Date | null
  finishedAt: Date | null
  inputJson: unknown
  outputJson: unknown
  errorJson: unknown
}

export type WorkflowTimelineRun = {
  id: string
  projectId: string
  status: WorkflowRunStatus
  currentStep: WorkflowRoleKey
  source: string
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  outputJson: unknown
  errorJson: unknown
}

export type WorkflowTimeline = {
  run: WorkflowTimelineRun | null
  steps: WorkflowTimelineStep[]
}

export type BrandAnalysisOutput = {
  summary: string
  keySignals: string[]
  risks: string[]
  positioning: string
  recommendedBrief: {
    brandName: string
    industry: string
    audience: string
    personality: string[]
    visualDirection: string[]
  }
}

export type KnowledgeSpecialistOutput = {
  summary: string
  brandVocabulary: string[]
  designGuardrails: string[]
  keywords: string[]
  notes: string[]
}

export type CreativeDirectionItem = {
  id: string
  title: string
  summary: string
  rationale: string
  visualDirection: string[]
  recommendedLogoType: string
  palette: string[]
  typography: string
}

export type CreativeDirectorOutput = {
  summary: string
  creativeDirections: CreativeDirectionItem[]
}

export type PromptDesignerBlueprint = {
  styleKey: PromptStyleKey
  title: string
  focus: string
  direction: string
  palette: string[]
  typography: string
  promptGuardrails: string[]
}

export type PromptDesignerOutput = {
  summary: string
  blueprints: PromptDesignerBlueprint[]
  sourceDirectionSummary: string | null
}

export type PromptGenerationItem = {
  styleKey: PromptStyleKey
  title: string
  promptText: string
  promptHint: string
  promptGuardrails: string[]
  sourceBlueprint: PromptDesignerBlueprint
}

export type PromptGenerationOutput = {
  summary: string
  prompts: PromptGenerationItem[]
}

export type PromptReviewItem = {
  promptIndex: number
  styleKey: PromptStyleKey
  title: string
  approved: boolean
  score: number
  strengths: string[]
  issues: string[]
  feedback: string
}

export type PromptReviewOutput = {
  summary: string
  reviews: PromptReviewItem[]
}

export type PromptScoreItem = {
  promptIndex: number
  styleKey: PromptStyleKey
  title: string
  score: number
  criteria: {
    brandMatch: number
    creativity: number
    clarity: number
    completeness: number
  }
  reviewStatus: PromptStatus
  notes: string[]
}

export type PromptScoreOutput = {
  summary: string
  scores: PromptScoreItem[]
}

export type PromptStoreItem = {
  styleKey: PromptStyleKey
  title: string
  promptId: string
  version: number
  status: PromptStatus
  latestScore: number | null
}

export type PromptStoreOutput = {
  summary: string
  prompts: PromptStoreItem[]
}

export type LogoGenerationItem = {
  styleKey: PromptStyleKey
  title: string
  promptId: string
  promptVersionId: string
  promptVersion: number
  status: 'queued' | 'generating' | 'completed' | 'failed'
  provider: string
  model: string
}

export type LogoGenerationOutput = {
  summary: string
  logos: LogoGenerationItem[]
}

export type LogoStoreItem = {
  styleKey: PromptStyleKey
  title: string
  logoId: string
  assetId: string | null
  status: 'queued' | 'generating' | 'completed' | 'failed'
}

export type LogoStoreOutput = {
  summary: string
  logos: LogoStoreItem[]
}

export type WorkflowRoleOutputMap = {
  brand_analyst: BrandAnalysisOutput
  knowledge_specialist: KnowledgeSpecialistOutput
  creative_director: CreativeDirectorOutput
  prompt_designer: PromptDesignerOutput
  prompt_generator: PromptGenerationOutput
  prompt_reviewer: PromptReviewOutput
  prompt_scorer: PromptScoreOutput
  prompt_store: PromptStoreOutput
  logo_generate: LogoGenerationOutput
  logo_store: LogoStoreOutput
}

export type WorkflowRoleInput = {
  project: {
    id: string
    name: string
  }
  brandForm: {
    formData: unknown
    aiSummary: unknown
  }
  previousOutputs: Partial<Record<WorkflowRoleKey, unknown>>
}
