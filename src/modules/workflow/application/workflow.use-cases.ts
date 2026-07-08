import type { ImageGenerationService } from '@/modules/images/application/image-generation.service'
import type { LogoRepository } from '@/modules/logos/application/logo.repository'
import type { PromptRepository } from '@/modules/prompts/application/prompt.repository'
import type { BrandFormRepository } from '@/modules/brand-form/application/brand-form.repository'
import type {
  PromptGenerationOutput,
  PromptReviewOutput,
  PromptScoreOutput,
  WorkflowRoleInput,
  WorkflowRoleKey,
  WorkflowTimeline,
  WorkflowTimelineStep
} from '@/modules/workflow/domain/workflow'
import type { ProjectRepository } from '@/modules/projects/application/project.repository'
import type { WorkflowRepository } from '@/modules/workflow/application/workflow.repository'
import type { GeneratedLogoDraft } from '@/modules/logos/domain/logo'
import { promptPipelineExecutors } from '@/modules/prompts/infrastructure/prompt-pipeline-executors'
import { WORKFLOW_STEP_LABELS, WORKFLOW_STEP_ORDER } from '@/modules/workflow/domain/workflow'
import { mockWorkflowExecutors } from '@/modules/workflow/infrastructure/workflow-role-executors'

const PROMPT_TRACK_KEYS = ['minimal', 'luxury', 'creative'] as const
const PROMPT_APPROVAL_SCORE_THRESHOLD = 7

function getFailedError(reason: string) {
  return {
    code: 'workflow_failed',
    message: reason,
    recoverable: true
  }
}

function buildStyleKeyMap<T extends { styleKey: string }>(items: T[]) {
  return new Map(items.map((item) => [item.styleKey, item] as const))
}

function assertExactPromptTrackSet(
  generated: PromptGenerationOutput | undefined,
  reviewed: PromptReviewOutput | undefined,
  scored: PromptScoreOutput | undefined
) {
  const generatedPrompts = generated?.prompts ?? []
  const reviewedPrompts = reviewed?.reviews ?? []
  const scoredPrompts = scored?.scores ?? []

  const generatedKeys = generatedPrompts.map((prompt) => prompt.styleKey)
  const reviewedKeys = reviewedPrompts.map((item) => item.styleKey)
  const scoredKeys = scoredPrompts.map((item) => item.styleKey)

  const generatedSet = new Set(generatedKeys)
  const reviewedSet = new Set(reviewedKeys)
  const scoredSet = new Set(scoredKeys)

  if (generatedKeys.length !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt generator must create exactly 3 styles: minimal, luxury, creative.')
  }

  if (reviewedKeys.length !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt reviewer must review exactly 3 styles: minimal, luxury, creative.')
  }

  if (scoredKeys.length !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt scorer must score exactly 3 styles: minimal, luxury, creative.')
  }

  if (generatedSet.size !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt generator has duplicate or invalid style keys.')
  }

  if (reviewedSet.size !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt reviewer has duplicate or invalid style keys.')
  }

  if (scoredSet.size !== PROMPT_TRACK_KEYS.length) {
    throw new Error('Prompt scorer has duplicate or invalid style keys.')
  }

  for (const key of PROMPT_TRACK_KEYS) {
    if (!generatedSet.has(key)) {
      throw new Error(`Prompt generator is missing required style: ${key}.`)
    }

    if (!reviewedSet.has(key)) {
      throw new Error(`Prompt reviewer is missing required style: ${key}.`)
    }

    if (!scoredSet.has(key)) {
      throw new Error(`Prompt scorer is missing required style: ${key}.`)
    }
  }

  const reviewByStyleKey = buildStyleKeyMap(reviewedPrompts)
  const scoreByStyleKey = buildStyleKeyMap(scoredPrompts)

  for (const key of PROMPT_TRACK_KEYS) {
    const generatedPrompt = generatedPrompts.find((prompt) => prompt.styleKey === key)
    const review = reviewByStyleKey.get(key)
    const score = scoreByStyleKey.get(key)

    if (!generatedPrompt || !review || !score) {
      throw new Error(`Prompt pipeline data is not aligned for style: ${key}.`)
    }
  }

  return {
    reviewByStyleKey,
    scoreByStyleKey
  }
}

function mergeRunOutput(currentOutput: unknown, stepKey: string, value: unknown) {
  return {
    ...(typeof currentOutput === 'object' && currentOutput !== null
      ? (currentOutput as Record<string, unknown>)
      : {}),
    [stepKey]: value
  }
}

function mapGeneratedLogo(item: GeneratedLogoDraft) {
  return {
    styleKey: item.styleKey,
    title: item.title,
    promptId: item.promptId,
    promptVersionId: item.promptVersionId,
    promptVersion: item.promptVersion,
    status: item.status,
    provider: item.provider,
    model: item.model
  }
}

function mapGeneratedLogoDraftsForRuntime(items: GeneratedLogoDraft[]) {
  return items.map((item) => mapGeneratedLogo(item))
}

function mapStoredLogoItem(item: {
  logo: {
    id: string
    styleKey: string
    title: string
    status: string
  }
  asset: { id: string | null } | null
}) {
  return {
    styleKey: item.logo.styleKey,
    title: item.logo.title,
    logoId: item.logo.id,
    assetId: item.asset?.id ?? null,
    status: item.logo.status
  }
}

export async function runBrandWorkflow(params: {
  projectId: string
  userId: string
  projectRepository: ProjectRepository
  brandFormRepository: BrandFormRepository
  promptRepository: PromptRepository
  workflowRepository: WorkflowRepository
  imageGenerationService: ImageGenerationService
  logoRepository: LogoRepository
  source?: string
}): Promise<WorkflowTimeline> {
  const project = await params.projectRepository.findOwnedById(params.projectId, params.userId)

  if (!project) {
    throw new Error('Project not found or you do not have permission to run workflow.')
  }

  const draft = await params.brandFormRepository.findByProjectId(project.id)

  if (!draft || draft.status !== 'completed') {
    throw new Error('Brand Form is not confirmed yet, workflow cannot start.')
  }

  const run = await params.workflowRepository.createRun({
    projectId: project.id,
    initiatedByUserId: params.userId,
    currentStep: 'brand_analyst',
    source: params.source ?? 'brand_form',
    inputJson: {
      project,
      brandForm: draft.formData,
      aiSummary: draft.aiSummary
    },
    status: 'running',
    startedAt: new Date()
  })

  const previousOutputs: Partial<Record<WorkflowRoleKey, unknown>> = {}
  let runtimeGeneratedLogoDrafts: GeneratedLogoDraft[] | null = null
  let currentRun = run
  const stepsSnapshot: WorkflowTimelineStep[] = []

  for (const [index, roleKey] of WORKFLOW_STEP_ORDER.entries()) {
    const roleLabel = WORKFLOW_STEP_LABELS[roleKey]
    const roleInput: WorkflowRoleInput = {
      project,
      brandForm: {
        formData: draft.formData,
        aiSummary: draft.aiSummary
      },
      previousOutputs
    }

    const stepRun = await params.workflowRepository.createStepRun({
      workflowRunId: currentRun.id,
      roleKey,
      roleLabel,
      stepOrder: index + 1,
      inputJson: roleInput,
      status: 'running',
      startedAt: new Date()
    })

    try {
      if (roleKey === 'prompt_store') {
        const generated = previousOutputs.prompt_generator as PromptGenerationOutput | undefined
        const reviewed = previousOutputs.prompt_reviewer as PromptReviewOutput | undefined
        const scored = previousOutputs.prompt_scorer as PromptScoreOutput | undefined

        const { reviewByStyleKey, scoreByStyleKey } = assertExactPromptTrackSet(
          generated,
          reviewed,
          scored
        )

        const promptPayloads = generated!.prompts.map((prompt) => {
          const review = reviewByStyleKey.get(prompt.styleKey)
          const score = scoreByStyleKey.get(prompt.styleKey)

          if (!review || !score) {
            throw new Error(`Prompt track is missing review or score for style: ${prompt.styleKey}.`)
          }

          const approved = review.approved && score.score >= PROMPT_APPROVAL_SCORE_THRESHOLD

          return {
            projectId: project.id,
            workflowRunId: currentRun.id,
            styleKey: prompt.styleKey,
            title: prompt.title,
            promptText: prompt.promptText,
            generatedJson: prompt,
            reviewJson: review,
            scoreJson: score,
            status: approved ? ('approved' as const) : ('rejected' as const),
            score: score.score,
            approvedAt: approved ? new Date() : null
          }
        })

        const storedPrompts = await params.promptRepository.storePromptVersions(promptPayloads)
        const result = {
          summary: `Stored ${storedPrompts.length} prompts with ids and versions.`,
          prompts: storedPrompts.map((item) => ({
            styleKey: item.prompt.styleKey,
            title: item.prompt.title,
            promptId: item.prompt.id,
            version: item.version.version,
            status: item.prompt.status,
            latestScore: item.prompt.latestScore
          })),
          debug: {
            provider: 'database',
            generatedAt: new Date().toISOString()
          }
        }

        const updatedStep = await params.workflowRepository.updateStepRun(stepRun.id, {
          status: 'success',
          outputJson: result,
          finishedAt: new Date()
        })

        previousOutputs[roleKey] = result.prompts
        currentRun =
          (await params.workflowRepository.updateRun(run.id, {
            currentStep: roleKey,
            outputJson: mergeRunOutput(currentRun.outputJson, roleKey, result.prompts)
          })) ?? currentRun

        stepsSnapshot.push({
          roleKey,
          roleLabel,
          stepOrder: index + 1,
          status: 'success',
          startedAt: updatedStep?.startedAt ?? null,
          finishedAt: updatedStep?.finishedAt ?? null,
          inputJson: roleInput,
          outputJson: result,
          errorJson: null
        })
      } else if (roleKey === 'logo_generate') {
        const promptPipeline = await params.promptRepository.listByProjectId(project.id)
        const generated = await params.imageGenerationService.generateLogos({
          projectId: project.id,
          workflowRunId: currentRun.id,
          prompts: promptPipeline
        })
        runtimeGeneratedLogoDrafts = generated.items

        const result = {
          summary: `Generated ${generated.items.length} logo drafts.`,
          logos: mapGeneratedLogoDraftsForRuntime(generated.items),
          debug: {
            provider: 'openai-image',
            generatedAt: new Date().toISOString()
          }
        }

        const updatedStep = await params.workflowRepository.updateStepRun(stepRun.id, {
          status: 'success',
          outputJson: result,
          finishedAt: new Date()
        })

        previousOutputs[roleKey] = {
          summary: result.summary,
          logos: result.logos
        }
        currentRun =
          (await params.workflowRepository.updateRun(run.id, {
            currentStep: roleKey,
            outputJson: mergeRunOutput(currentRun.outputJson, roleKey, {
              summary: result.summary,
              logos: result.logos
            })
          })) ?? currentRun

        stepsSnapshot.push({
          roleKey,
          roleLabel,
          stepOrder: index + 1,
          status: 'success',
          startedAt: updatedStep?.startedAt ?? null,
          finishedAt: updatedStep?.finishedAt ?? null,
          inputJson: roleInput,
          outputJson: result,
          errorJson: null
        })
      } else if (roleKey === 'logo_store') {
        const generatedItems = runtimeGeneratedLogoDrafts ?? undefined

        if (!generatedItems || generatedItems.length !== 3) {
          throw new Error('Workflow must generate logo drafts in runtime before storing logos.')
        }

        const storedLogos = await params.logoRepository.storeGeneratedLogos({
          items: generatedItems
        })

        const result = {
          summary: `Stored ${storedLogos.items.length} logos and assets.`,
          logos: storedLogos.items.map(mapStoredLogoItem),
          debug: {
            provider: 'database',
            generatedAt: new Date().toISOString()
          }
        }

        const updatedStep = await params.workflowRepository.updateStepRun(stepRun.id, {
          status: 'success',
          outputJson: result,
          finishedAt: new Date()
        })

        previousOutputs[roleKey] = {
          summary: result.summary,
          logos: result.logos
        }
        currentRun =
          (await params.workflowRepository.updateRun(run.id, {
            currentStep: roleKey,
            outputJson: mergeRunOutput(currentRun.outputJson, roleKey, {
              summary: result.summary,
              logos: result.logos
            })
          })) ?? currentRun

        stepsSnapshot.push({
          roleKey,
          roleLabel,
          stepOrder: index + 1,
          status: 'success',
          startedAt: updatedStep?.startedAt ?? null,
          finishedAt: updatedStep?.finishedAt ?? null,
          inputJson: roleInput,
          outputJson: result,
          errorJson: null
        })
      } else {
        const executor = mockWorkflowExecutors[roleKey] ?? promptPipelineExecutors[roleKey]

        if (!executor) {
          throw new Error(`Missing workflow executor for ${roleKey}.`)
        }

        const result = await executor(roleInput)
        const updatedStep = await params.workflowRepository.updateStepRun(stepRun.id, {
          status: 'success',
          outputJson: result,
          finishedAt: new Date()
        })

        previousOutputs[roleKey] = result.data
        currentRun =
          (await params.workflowRepository.updateRun(run.id, {
            currentStep: roleKey,
            outputJson: mergeRunOutput(currentRun.outputJson, roleKey, result.data)
          })) ?? currentRun

        stepsSnapshot.push({
          roleKey,
          roleLabel,
          stepOrder: index + 1,
          status: 'success',
          startedAt: updatedStep?.startedAt ?? null,
          finishedAt: updatedStep?.finishedAt ?? null,
          inputJson: roleInput,
          outputJson: result,
          errorJson: null
        })
      }
    } catch (error) {
      const failedOutput = getFailedError(error instanceof Error ? error.message : 'Unknown workflow error')
      await params.workflowRepository.updateStepRun(stepRun.id, {
        status: 'failed',
        errorJson: failedOutput,
        finishedAt: new Date()
      })

      currentRun =
        (await params.workflowRepository.updateRun(run.id, {
          status: 'failed',
          errorJson: failedOutput,
          currentStep: roleKey,
          finishedAt: new Date()
        })) ?? currentRun

      stepsSnapshot.push({
        roleKey,
        roleLabel,
        stepOrder: index + 1,
        status: 'failed',
        startedAt: stepRun.startedAt,
        finishedAt: new Date(),
        inputJson: roleInput,
        outputJson: null,
        errorJson: failedOutput
      })

      return {
        run: {
          id: currentRun.id,
          projectId: currentRun.projectId,
          status: 'failed',
          currentStep: roleKey,
          source: currentRun.source,
          startedAt: currentRun.startedAt,
          finishedAt: currentRun.finishedAt,
          createdAt: currentRun.createdAt,
          updatedAt: currentRun.updatedAt,
          outputJson: currentRun.outputJson,
          errorJson: currentRun.errorJson
        },
        steps: stepsSnapshot
      }
    }
  }

  currentRun =
    (await params.workflowRepository.updateRun(run.id, {
      status: 'success',
      currentStep: 'logo_store',
      finishedAt: new Date()
    })) ?? currentRun

  const latest = await params.workflowRepository.getLatestRunByProjectId(project.id)

  return {
    run: latest.run
      ? {
          ...latest.run,
          status: 'success'
        }
      : {
          id: currentRun.id,
          projectId: currentRun.projectId,
          status: 'success',
          currentStep: 'logo_store',
          source: currentRun.source,
          startedAt: currentRun.startedAt,
          finishedAt: currentRun.finishedAt,
          createdAt: currentRun.createdAt,
          updatedAt: currentRun.updatedAt,
          outputJson: currentRun.outputJson,
          errorJson: currentRun.errorJson
        },
    steps: latest.steps.length > 0 ? latest.steps : stepsSnapshot
  }
}

export async function getWorkflowTimeline(params: {
  projectId: string
  userId: string
  projectRepository: ProjectRepository
  workflowRepository: WorkflowRepository
}): Promise<WorkflowTimeline> {
  const project = await params.projectRepository.findOwnedById(params.projectId, params.userId)

  if (!project) {
    return { run: null, steps: [] }
  }

  return params.workflowRepository.getTimelineByProjectId(project.id)
}
