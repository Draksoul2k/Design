import type {
  CreativeDirectorOutput,
  PromptDesignerOutput,
  PromptGenerationOutput,
  PromptReviewOutput,
  PromptScoreOutput,
  WorkflowRoleInput,
  WorkflowRoleKey
} from '@/modules/workflow/domain/workflow'
import type { PromptStatus as PromptEntityStatus } from '@/modules/prompts/domain/prompt'
import type { WorkflowRoleExecutor } from '@/modules/workflow/infrastructure/workflow-role-executors'

function stringifyText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  return ''
}

function stringifyArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return []
}

function getCreativeDirectorOutput(input: WorkflowRoleInput): CreativeDirectorOutput | undefined {
  return input.previousOutputs.creative_director as CreativeDirectorOutput | undefined
}

function getBrandFormSnapshot(input: WorkflowRoleInput) {
  const form = input.brandForm.formData as Record<string, unknown>

  return {
    brandName: stringifyText(form.brandName),
    industry: stringifyText(form.industry),
    productService: stringifyText(form.productService),
    uniqueSellingPoint: stringifyText(form.uniqueSellingPoint),
    preferredStyle: stringifyArray(form.preferredStyle),
    preferredColors: stringifyArray(form.preferredColors),
    typographyPreference: stringifyArray(form.typographyPreference),
    logoType: stringifyText(form.logoType)
  }
}

function buildPromptText(args: {
  brandName: string
  styleKey: string
  focus: string
  palette: string[]
  typography: string
  direction: string
}) {
  return [
    `Create a ${args.styleKey} logo prompt for ${args.brandName || 'the brand'}.`,
    `Visual focus: ${args.focus}.`,
    `Design direction: ${args.direction}.`,
    `Color palette: ${args.palette.join(', ') || 'black, white'}.`,
    `Typography: ${args.typography}.`,
    'The logo must be clear, premium, editable, and suitable for agency-grade branding work.'
  ].join(' ')
}

function scorePrompt(promptText: string, direction: string) {
  const lengthScore = Math.min(10, Math.max(6, Math.round(promptText.length / 80)))
  const directionScore = direction.length > 0 ? 8 : 6
  const clarity = 8
  const creativity = direction.includes('minimal') ? 7 : 8
  const total = Math.round((lengthScore + directionScore + clarity + creativity) / 4)

  return {
    brandMatch: directionScore,
    creativity,
    clarity,
    completeness: lengthScore,
    total
  }
}

const buildPromptPipelineExecutor = <T,>(
  summaryPrefix: string,
  buildData: (input: WorkflowRoleInput) => T
): WorkflowRoleExecutor => {
  return async (input) => {
    const data = buildData(input)

    return {
      summary: `${summaryPrefix} completed for ${input.project.name}.`,
      data,
      debug: {
        provider: 'mock',
        generatedAt: new Date().toISOString()
      }
    }
  }
}

export const promptPipelineExecutors: Partial<Record<WorkflowRoleKey, WorkflowRoleExecutor>> = {
  prompt_designer: buildPromptPipelineExecutor('Prompt designer', (input) => {
    const snapshot = getBrandFormSnapshot(input)
    const creative = getCreativeDirectorOutput(input)
    const primaryDirection = creative?.creativeDirections?.[0]

    const blueprints: PromptDesignerOutput['blueprints'] = [
      {
        styleKey: 'minimal',
        title: 'Minimal Prompt Blueprint',
        focus: 'clean geometry, whitespace, and strong readability',
        direction:
          primaryDirection?.summary ??
          snapshot.preferredStyle[0] ??
          'minimal and refined identity system',
        palette: snapshot.preferredColors.length > 0 ? snapshot.preferredColors : ['black', 'white'],
        typography: snapshot.typographyPreference[0] || 'clean sans serif',
        promptGuardrails: ['No clutter', 'No decorative overload', 'Keep the mark scalable']
      },
      {
        styleKey: 'luxury',
        title: 'Luxury Prompt Blueprint',
        focus: 'premium proportions, elegant spacing, and refined contrast',
        direction:
          creative?.creativeDirections?.[1]?.summary ??
          snapshot.uniqueSellingPoint ??
          'luxury brand presence with premium cues',
        palette: snapshot.preferredColors.length > 0 ? snapshot.preferredColors : ['black', 'gold'],
        typography: snapshot.typographyPreference[0] || 'elegant serif',
        promptGuardrails: ['Avoid cheap ornamental details', 'Keep the logo high-end', 'Use restrained contrast']
      },
      {
        styleKey: 'creative',
        title: 'Creative Prompt Blueprint',
        focus: 'distinctive composition with memorable brand storytelling',
        direction:
          creative?.creativeDirections?.[2]?.summary ??
          snapshot.productService ??
          'creative and distinctive identity language',
        palette: snapshot.preferredColors.length > 0 ? snapshot.preferredColors : ['navy', 'white'],
        typography: snapshot.typographyPreference[0] || 'modern custom lettering',
        promptGuardrails: ['Still readable', 'Still brand-led', 'Distinct but not chaotic']
      }
    ]

    return {
      summary: `Prepared ${blueprints.length} prompt blueprints for prompt generation.`,
      blueprints,
      sourceDirectionSummary: creative?.summary ?? null
    } satisfies PromptDesignerOutput
  }),
  prompt_generator: buildPromptPipelineExecutor('Prompt generator', (input) => {
    const designer = input.previousOutputs.prompt_designer as PromptDesignerOutput | undefined
    const snapshot = getBrandFormSnapshot(input)

    const prompts = (designer?.blueprints ?? []).map((blueprint) => {
      const promptText = buildPromptText({
        brandName: snapshot.brandName,
        styleKey: blueprint.styleKey,
        focus: blueprint.focus,
        palette: blueprint.palette,
        typography: blueprint.typography,
        direction: blueprint.direction
      })

      return {
        styleKey: blueprint.styleKey,
        title: blueprint.title,
        promptText,
        promptHint: blueprint.focus,
        promptGuardrails: blueprint.promptGuardrails,
        sourceBlueprint: blueprint
      }
    })

    const output: PromptGenerationOutput = {
      summary: `Generated ${prompts.length} prompts from the designer blueprints.`,
      prompts
    }

    return output
  }),
  prompt_reviewer: buildPromptPipelineExecutor('Prompt reviewer', (input) => {
    const generated = input.previousOutputs.prompt_generator as PromptGenerationOutput | undefined

    const reviews = (generated?.prompts ?? []).map((prompt, index) => {
      const score = scorePrompt(prompt.promptText, prompt.styleKey)
      const issues =
        score.total < 7
          ? ['Add more differentiation or clarity before final storage.']
          : prompt.styleKey === 'creative'
            ? ['Creative prompt may need a slight caution review for uniqueness.']
            : []

      return {
        promptIndex: index + 1,
        styleKey: prompt.styleKey,
        title: prompt.title,
        approved: true,
        score: score.total,
        strengths: [
          'Clear brand intent',
          'Readable structure',
          prompt.styleKey === 'luxury' ? 'Premium tone' : 'Controlled creative language'
        ],
        issues,
        feedback:
          issues.length === 0
            ? 'Prompt is approved for scoring.'
            : 'Prompt is approved with caution notes.'
      }
    })

    const output: PromptReviewOutput = {
      summary: `Reviewed ${reviews.length} prompts with per-prompt approval decisions.`,
      reviews
    }

    return output
  }),
  prompt_scorer: buildPromptPipelineExecutor('Prompt scorer', (input) => {
    const generated = input.previousOutputs.prompt_generator as PromptGenerationOutput | undefined
    const reviewed = input.previousOutputs.prompt_reviewer as PromptReviewOutput | undefined

    const scores = (generated?.prompts ?? []).map((prompt, index) => {
      const criteria = scorePrompt(prompt.promptText, prompt.styleKey)
      const review = reviewed?.reviews?.[index]
      const reviewStatus: PromptEntityStatus = review?.approved ? 'approved' : 'rejected'

      return {
        promptIndex: index + 1,
        styleKey: prompt.styleKey,
        title: prompt.title,
        score: criteria.total,
        criteria: {
          brandMatch: criteria.brandMatch,
          creativity: criteria.creativity,
          clarity: criteria.clarity,
          completeness: criteria.completeness
        },
        reviewStatus,
        notes: review?.issues ?? []
      }
    })

    const output: PromptScoreOutput = {
      summary: `Calculated quality scores for ${scores.length} prompts.`,
      scores
    }

    return output
  })
}
