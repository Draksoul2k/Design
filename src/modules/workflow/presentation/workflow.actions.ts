'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import { brandFormRepository } from '@/modules/brand-form/infrastructure/prisma-brand-form.repository'
import { ImageGenerationService } from '@/modules/images/application/image-generation.service'
import { openAiImageProvider } from '@/modules/images/infrastructure/openai-image.provider'
import { logoRepository } from '@/modules/logos/infrastructure/prisma-logo.repository'
import { promptRepository } from '@/modules/prompts/infrastructure/prisma-prompt.repository'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'
import { runBrandWorkflow } from '@/modules/workflow/application/workflow.use-cases'
import { workflowRepository } from '@/modules/workflow/infrastructure/prisma-workflow.repository'

const imageGenerationService = new ImageGenerationService(openAiImageProvider)

export async function runWorkflowAction(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const projectId = String(formData.get('projectId') ?? '').trim()

  if (!projectId) {
    redirect('/projects')
  }

  await runBrandWorkflow({
    projectId,
    userId: user.id,
    projectRepository,
    brandFormRepository,
    promptRepository,
    workflowRepository,
    imageGenerationService,
    logoRepository,
    source: 'manual'
  })

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/projects')
  redirect(`/projects/${projectId}`)
}
