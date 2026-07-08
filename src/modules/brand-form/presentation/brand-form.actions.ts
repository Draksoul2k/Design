'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import {
  confirmBrandFormReview,
  saveBrandFormDraft
} from '@/modules/brand-form/application/brand-form.use-cases'
import { brandFormRepository } from '@/modules/brand-form/infrastructure/prisma-brand-form.repository'
import { ImageGenerationService } from '@/modules/images/application/image-generation.service'
import { openAiImageProvider } from '@/modules/images/infrastructure/openai-image.provider'
import { logoRepository } from '@/modules/logos/infrastructure/prisma-logo.repository'
import type { BrandFormStepId, BrandFormValues } from '@/modules/brand-form/domain/brand-form'
import { promptRepository } from '@/modules/prompts/infrastructure/prisma-prompt.repository'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'
import { workflowRepository } from '@/modules/workflow/infrastructure/prisma-workflow.repository'
import { runBrandWorkflow } from '@/modules/workflow/application/workflow.use-cases'

const imageGenerationService = new ImageGenerationService(openAiImageProvider)

export type BrandFormActionState = {
  status: 'idle' | 'error' | 'success'
  message: string
}

export async function saveBrandFormDraftAction(input: {
  projectId: string
  currentStep: BrandFormStepId
  formData: BrandFormValues
}): Promise<BrandFormActionState> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const project = await projectRepository.findOwnedById(input.projectId, user.id)

  if (!project) {
    return {
      status: 'error',
      message: 'Bạn không có quyền chỉnh sửa Project này.'
    }
  }

  try {
    await saveBrandFormDraft(brandFormRepository, input)
    revalidatePath(`/projects/${input.projectId}/brand-form`)

    return {
      status: 'success',
      message: 'Draft đã được lưu.'
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể lưu brand form.'
    }
  }
}

export async function confirmBrandFormAction(input: {
  projectId: string
  formData: BrandFormValues
}): Promise<BrandFormActionState> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const project = await projectRepository.findOwnedById(input.projectId, user.id)

  if (!project) {
    return {
      status: 'error',
      message: 'Bạn không có quyền xác nhận Brand Form của Project này.'
    }
  }

  try {
    await confirmBrandFormReview(brandFormRepository, input)
    await runBrandWorkflow({
      projectId: input.projectId,
      userId: user.id,
      projectRepository,
      brandFormRepository,
      promptRepository,
      workflowRepository,
      imageGenerationService,
      logoRepository,
      source: 'brand_form_confirmed'
    })
    revalidatePath(`/projects/${input.projectId}/brand-form`)
    revalidatePath(`/projects/${input.projectId}`)
    revalidatePath('/dashboard')
    revalidatePath('/projects')

    return {
      status: 'success',
      message: 'Brand brief đã được xác nhận và workflow đã được khởi chạy.'
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể xác nhận brand form.'
    }
  }
}
