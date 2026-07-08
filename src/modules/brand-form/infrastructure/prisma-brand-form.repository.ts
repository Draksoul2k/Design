import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type {
  BrandFormRepository,
  BrandFormDraftRecord
} from '@/modules/brand-form/application/brand-form.repository'
import type {
  BrandFormStepId,
  BrandFormSummary,
  BrandFormValues
} from '@/modules/brand-form/domain/brand-form'

type PrismaBrandFormDraft = {
  id: string
  projectId: string
  currentStep: string
  status: string
  formData: unknown
  aiSummary: unknown
  reviewConfirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapDraft(record: PrismaBrandFormDraft): BrandFormDraftRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    currentStep: record.currentStep as BrandFormStepId,
    status: record.status,
    formData: record.formData as BrandFormValues,
    aiSummary: (record.aiSummary as BrandFormSummary | null) ?? null,
    reviewConfirmedAt: record.reviewConfirmedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

export class PrismaBrandFormRepository implements BrandFormRepository {
  async findByProjectId(projectId: string): Promise<BrandFormDraftRecord | null> {
    const record = await prisma.brandFormDraft.findUnique({
      where: { projectId }
    })

    return record ? mapDraft(record) : null
  }

  async upsertDraft(input: {
    projectId: string
    currentStep: BrandFormStepId
    status: string
    formData: BrandFormValues
    aiSummary: BrandFormSummary | null
    reviewConfirmedAt?: Date | null
  }): Promise<BrandFormDraftRecord> {
    const record = await prisma.brandFormDraft.upsert({
      where: { projectId: input.projectId },
      create: {
        projectId: input.projectId,
        currentStep: input.currentStep,
        status: input.status,
        formData: input.formData,
        aiSummary: input.aiSummary ?? Prisma.JsonNull,
        reviewConfirmedAt: input.reviewConfirmedAt ?? null
      },
      update: {
        currentStep: input.currentStep,
        status: input.status,
        formData: input.formData,
        aiSummary: input.aiSummary ?? Prisma.JsonNull,
        reviewConfirmedAt: input.reviewConfirmedAt ?? null
      }
    })

    return mapDraft(record)
  }
}

export const brandFormRepository = new PrismaBrandFormRepository()
