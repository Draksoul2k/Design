import type { BrandFormSummary, BrandFormStepId, BrandFormValues } from '@/modules/brand-form/domain/brand-form'

export interface BrandFormDraftRecord {
  id: string
  projectId: string
  currentStep: BrandFormStepId
  status: string
  formData: BrandFormValues
  aiSummary: BrandFormSummary | null
  reviewConfirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface BrandFormRepository {
  findByProjectId(projectId: string): Promise<BrandFormDraftRecord | null>
  upsertDraft(input: {
    projectId: string
    currentStep: BrandFormStepId
    status: string
    formData: BrandFormValues
    aiSummary: BrandFormSummary | null
    reviewConfirmedAt?: Date | null
  }): Promise<BrandFormDraftRecord>
}

