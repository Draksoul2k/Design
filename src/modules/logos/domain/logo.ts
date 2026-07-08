import type { PromptStyleKey } from '@/modules/prompts/domain/prompt'

export const LOGO_STATUS_KEYS = ['queued', 'generating', 'completed', 'failed'] as const
export type LogoStatus = (typeof LOGO_STATUS_KEYS)[number]

export type LogoAssetKind = 'primary'

export type GeneratedLogoAsset = {
  kind: LogoAssetKind
  mimeType: string
  dataUrl: string | null
  sourceUrl: string | null
  width: number | null
  height: number | null
}

export type GeneratedLogoDraft = {
  projectId: string
  workflowRunId: string
  promptId: string
  promptVersionId: string
  promptVersion: number
  styleKey: PromptStyleKey
  title: string
  provider: string
  model: string
  status: LogoStatus
  generationInputJson: unknown
  generationOutputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  asset: GeneratedLogoAsset
}

export type LogoRecord = {
  id: string
  projectId: string
  workflowRunId: string
  promptId: string
  promptVersionId: string
  styleKey: PromptStyleKey
  title: string
  provider: string
  model: string
  status: LogoStatus
  generationInputJson: unknown
  generationOutputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type LogoAssetRecord = {
  id: string
  logoId: string
  kind: LogoAssetKind
  mimeType: string
  dataUrl: string | null
  sourceUrl: string | null
  width: number | null
  height: number | null
  createdAt: Date
  updatedAt: Date
}

export type LogoPipelineItem = {
  logo: LogoRecord
  asset: LogoAssetRecord | null
}

export type LogoPipelineSnapshot = {
  items: LogoPipelineItem[]
}
