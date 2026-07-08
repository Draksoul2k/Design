import type { ProjectRepository } from '@/modules/projects/application/project.repository'
import type {
  BrandFormRepository,
  BrandFormDraftRecord
} from '@/modules/brand-form/application/brand-form.repository'
import {
  buildMockBrandSummary,
  hasEnoughBrandData,
  type BrandFormStepId,
  type BrandFormValues,
  DEFAULT_BRAND_FORM_VALUES
} from '@/modules/brand-form/domain/brand-form'

export async function getBrandFormWorkspace(
  projectRepository: ProjectRepository,
  brandFormRepository: BrandFormRepository,
  projectId: string,
  userId: string
): Promise<{ project: { id: string; name: string } | null; draft: BrandFormDraftRecord | null }> {
  const project = await projectRepository.findOwnedById(projectId, userId)

  if (!project) {
    return { project: null, draft: null }
  }

  const draft = await brandFormRepository.findByProjectId(projectId)

  return {
    project: {
      id: project.id,
      name: project.name
    },
    draft
  }
}

export async function saveBrandFormDraft(
  brandFormRepository: BrandFormRepository,
  input: {
    projectId: string
    currentStep: BrandFormStepId
    formData: BrandFormValues
    status?: string
  }
) {
  return brandFormRepository.upsertDraft({
    projectId: input.projectId,
    currentStep: input.currentStep,
    status: input.status ?? 'draft',
    formData: input.formData,
    aiSummary: hasEnoughBrandData(input.formData)
      ? buildMockBrandSummary(input.formData)
      : null
  })
}

export async function confirmBrandFormReview(
  brandFormRepository: BrandFormRepository,
  input: {
    projectId: string
    formData: BrandFormValues
  }
) {
  const summary = buildMockBrandSummary(input.formData)

  return brandFormRepository.upsertDraft({
    projectId: input.projectId,
    currentStep: 'ai_summary',
    status: 'completed',
    formData: input.formData,
    aiSummary: summary,
    reviewConfirmedAt: new Date()
  })
}

export function getInitialBrandFormValues(
  draft: BrandFormDraftRecord | null
): BrandFormValues {
  return draft?.formData ?? DEFAULT_BRAND_FORM_VALUES
}

