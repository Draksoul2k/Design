import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { PromptRepository, PromptVersionInput } from '@/modules/prompts/application/prompt.repository'
import type {
  PromptPipelineItem,
  PromptPipelineSnapshot,
  PromptStatus,
  PromptStyleKey,
  PromptTrackRecord,
  PromptVersionRecord
} from '@/modules/prompts/domain/prompt'

type PrismaPrompt = {
  id: string
  projectId: string
  styleKey: string
  title: string
  status: string
  currentVersion: number
  latestScore: number | null
  latestPromptVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

type PrismaPromptVersion = {
  id: string
  promptId: string
  workflowRunId: string
  version: number
  status: string
  promptText: string
  generatedJson: unknown
  reviewJson: unknown
  scoreJson: unknown
  score: number | null
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapPrompt(record: PrismaPrompt): PromptTrackRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    styleKey: record.styleKey as PromptStyleKey,
    title: record.title,
    status: record.status as PromptStatus,
    currentVersion: record.currentVersion,
    latestScore: record.latestScore,
    latestPromptVersionId: record.latestPromptVersionId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

function mapVersion(record: PrismaPromptVersion): PromptVersionRecord {
  return {
    id: record.id,
    promptId: record.promptId,
    workflowRunId: record.workflowRunId,
    version: record.version,
    status: record.status as PromptStatus,
    promptText: record.promptText,
    generatedJson: record.generatedJson,
    reviewJson: record.reviewJson,
    scoreJson: record.scoreJson,
    score: record.score,
    approvedAt: record.approvedAt,
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

function isRetryablePromptVersionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('Unique constraint') || error.message.includes('Transaction')
}

function mapPromptVersionInput(input: PromptVersionInput) {
  return {
    projectId: input.projectId,
    workflowRunId: input.workflowRunId,
    styleKey: input.styleKey,
    title: input.title,
    promptText: input.promptText,
    generatedJson: input.generatedJson,
    reviewJson: input.reviewJson,
    scoreJson: input.scoreJson,
    status: input.status,
    score: input.score,
    approvedAt: input.approvedAt ?? null
  }
}

async function storePromptVersionInTx(
  tx: Prisma.TransactionClient,
  input: PromptVersionInput
): Promise<{
  prompt: PromptTrackRecord
  version: PromptVersionRecord
}> {
  const prompt = await tx.prompt.upsert({
    where: {
      projectId_styleKey: {
        projectId: input.projectId,
        styleKey: input.styleKey
      }
    },
    create: {
      projectId: input.projectId,
      styleKey: input.styleKey,
      title: input.title,
      status: input.status,
      currentVersion: 0,
      latestScore: input.score,
      latestPromptVersionId: null
    },
    update: {
      title: input.title,
      status: input.status,
      latestScore: input.score
    }
  })

  const lockedPrompt = await tx.$queryRaw<Array<{ currentVersion: number }>>`
    SELECT "currentVersion"
    FROM "Prompt"
    WHERE id = ${prompt.id}
    FOR UPDATE
  `

  const nextVersion = (lockedPrompt[0]?.currentVersion ?? 0) + 1

  const version = await tx.promptVersion.create({
    data: {
      promptId: prompt.id,
      workflowRunId: input.workflowRunId,
      version: nextVersion,
      status: input.status,
      promptText: input.promptText,
      generatedJson: toJsonValue(input.generatedJson),
      reviewJson: toNullableJsonValue(input.reviewJson),
      scoreJson: toNullableJsonValue(input.scoreJson),
      score: input.score,
      approvedAt: input.approvedAt ?? null
    }
  })

  const updatedPrompt = await tx.prompt.update({
    where: { id: prompt.id },
    data: {
      currentVersion: nextVersion,
      status: input.status,
      latestScore: input.score,
      latestPromptVersionId: version.id
    }
  })

  return {
    prompt: mapPrompt(updatedPrompt),
    version: mapVersion(version)
  }
}

export class PrismaPromptRepository implements PromptRepository {
  async storePromptVersion(input: PromptVersionInput): Promise<{
    prompt: PromptTrackRecord
    version: PromptVersionRecord
  }> {
    const result = await this.storePromptVersions([input])
    return result[0]
  }

  async storePromptVersions(
    inputs: PromptVersionInput[]
  ): Promise<Array<{
    prompt: PromptTrackRecord
    version: PromptVersionRecord
  }>> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const stored: Array<{
            prompt: PromptTrackRecord
            version: PromptVersionRecord
          }> = []

          for (const input of inputs) {
            stored.push(await storePromptVersionInTx(tx, mapPromptVersionInput(input)))
          }

          return stored
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      )
    } catch (error) {
      if (isRetryablePromptVersionError(error)) {
        throw new Error('Không thể lưu Prompt vì version conflict. Vui lòng thử lại.')
      }

      throw error
    }
  }

  async listByProjectId(projectId: string): Promise<PromptPipelineSnapshot> {
    const prompts = await prisma.prompt.findMany({
      where: { projectId },
      orderBy: [{ createdAt: 'asc' }, { styleKey: 'asc' }],
      include: {
        versions: {
          orderBy: { version: 'asc' }
        }
      }
    })

    const items: PromptPipelineItem[] = prompts.map((prompt) => {
      const track = mapPrompt(prompt)
      const versions = prompt.versions.map((version) => mapVersion(version))
      const latestVersion = versions.length > 0 ? versions[versions.length - 1] ?? null : null

      return {
        prompt: track,
        latestVersion,
        versions
      }
    })

    return { items }
  }
}

export const promptRepository = new PrismaPromptRepository()
