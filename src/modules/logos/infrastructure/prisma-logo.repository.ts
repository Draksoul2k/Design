import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { LogoRepository } from '@/modules/logos/application/logo.repository'
import type {
  GeneratedLogoDraft,
  LogoAssetRecord,
  LogoPipelineItem,
  LogoPipelineSnapshot,
  LogoRecord
} from '@/modules/logos/domain/logo'
import type { PromptStyleKey } from '@/modules/prompts/domain/prompt'

type PrismaLogo = {
  id: string
  projectId: string
  workflowRunId: string
  promptId: string
  promptVersionId: string
  styleKey: string
  title: string
  provider: string
  model: string
  status: string
  generationInputJson: unknown
  generationOutputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type PrismaLogoAsset = {
  id: string
  logoId: string
  kind: string
  mimeType: string
  dataUrl: string | null
  sourceUrl: string | null
  width: number | null
  height: number | null
  createdAt: Date
  updatedAt: Date
}

function mapLogo(record: PrismaLogo): LogoRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    workflowRunId: record.workflowRunId,
    promptId: record.promptId,
    promptVersionId: record.promptVersionId,
    styleKey: record.styleKey as PromptStyleKey,
    title: record.title,
    provider: record.provider,
    model: record.model,
    status: record.status as LogoRecord['status'],
    generationInputJson: record.generationInputJson,
    generationOutputJson: record.generationOutputJson,
    errorJson: record.errorJson,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

function mapAsset(record: PrismaLogoAsset): LogoAssetRecord {
  return {
    id: record.id,
    logoId: record.logoId,
    kind: record.kind as LogoAssetRecord['kind'],
    mimeType: record.mimeType,
    dataUrl: record.dataUrl,
    sourceUrl: record.sourceUrl,
    width: record.width,
    height: record.height,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

function toNullableJsonValue(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
  return value === null ? Prisma.JsonNull : toJsonValue(value)
}

function sanitizeGenerationOutputJson(draft: GeneratedLogoDraft) {
  const output = draft.generationOutputJson as {
    provider?: string
    model?: string
    revisedPrompt?: string | null
    mimeType?: string
    sourceUrl?: string | null
    usage?: unknown
  } | null

  return {
    provider: output?.provider ?? draft.provider,
    model: output?.model ?? draft.model,
    revisedPrompt: output?.revisedPrompt ?? null,
    mimeType: output?.mimeType ?? draft.asset.mimeType,
    sourceUrl: output?.sourceUrl ?? draft.asset.sourceUrl,
    usage: output?.usage ?? null
  }
}

function mapDraft(input: GeneratedLogoDraft) {
  return {
    projectId: input.projectId,
    workflowRunId: input.workflowRunId,
    promptId: input.promptId,
    promptVersionId: input.promptVersionId,
    promptVersion: input.promptVersion,
    styleKey: input.styleKey,
    title: input.title,
    provider: input.provider,
    model: input.model,
    status: input.status,
    generationInputJson: input.generationInputJson,
    generationOutputJson: input.generationOutputJson,
    errorJson: input.errorJson,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    asset: input.asset
  }
}

export class PrismaLogoRepository implements LogoRepository {
  async storeGeneratedLogos(input: { items: GeneratedLogoDraft[] }): Promise<LogoPipelineSnapshot> {
    const items = await prisma.$transaction(async (tx) => {
      const storedItems: LogoPipelineItem[] = []

      for (const draft of input.items) {
        const payload = mapDraft(draft)

        const logo = await tx.logo.create({
          data: {
            projectId: payload.projectId,
            workflowRunId: payload.workflowRunId,
            promptId: payload.promptId,
            promptVersionId: payload.promptVersionId,
            styleKey: payload.styleKey,
            title: payload.title,
            provider: payload.provider,
            model: payload.model,
            status: payload.status,
            generationInputJson: toJsonValue(payload.generationInputJson),
            generationOutputJson: toJsonValue(sanitizeGenerationOutputJson(payload)),
            errorJson: toNullableJsonValue(payload.errorJson),
            startedAt: payload.startedAt,
            finishedAt: payload.finishedAt
          }
        })

        const asset = await tx.logoAsset.create({
          data: {
            logoId: logo.id,
            kind: payload.asset.kind,
            mimeType: payload.asset.mimeType,
            dataUrl: payload.asset.dataUrl,
            sourceUrl: payload.asset.sourceUrl,
            width: payload.asset.width,
            height: payload.asset.height
          }
        })

        storedItems.push({
          logo: mapLogo(logo),
          asset: mapAsset(asset)
        })
      }

      return storedItems
    })

    return { items }
  }

  async listByProjectId(projectId: string): Promise<LogoPipelineSnapshot> {
    const logos = await prisma.logo.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        assets: { orderBy: { createdAt: 'asc' } }
      }
    })

    return {
      items: logos.map((logo) => ({
        logo: mapLogo(logo),
        asset: logo.assets[0] ? mapAsset(logo.assets[0]) : null
      }))
    }
  }
}

export const logoRepository = new PrismaLogoRepository()
