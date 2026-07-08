import type {
  BrandAnalysisOutput,
  CreativeDirectorOutput,
  CreativeDirectionItem,
  KnowledgeSpecialistOutput,
  WorkflowRoleInput,
  WorkflowRoleKey
} from '@/modules/workflow/domain/workflow'

export type WorkflowExecutionResult = {
  summary: string
  data: unknown
  debug: {
    provider: string
    generatedAt: string
  }
}

export type WorkflowRoleExecutor = (input: WorkflowRoleInput) => Promise<WorkflowExecutionResult>

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

function getBrandFormSnapshot(input: WorkflowRoleInput) {
  const form = input.brandForm.formData as Record<string, unknown>

  return {
    brandName: stringifyText(form.brandName),
    industry: stringifyText(form.industry),
    primaryAudience: stringifyText(form.primaryAudience),
    productService: stringifyText(form.productService),
    uniqueSellingPoint: stringifyText(form.uniqueSellingPoint),
    personalityTraits: stringifyArray(form.personalityTraits),
    preferredStyle: stringifyArray(form.preferredStyle),
    preferredColors: stringifyArray(form.preferredColors),
    typographyPreference: stringifyArray(form.typographyPreference),
    logoType: stringifyText(form.logoType)
  }
}

export const mockWorkflowExecutors: Partial<Record<WorkflowRoleKey, WorkflowRoleExecutor>> = {
  brand_analyst: async (input) => {
    const snapshot = getBrandFormSnapshot(input)
    const output: BrandAnalysisOutput = {
      summary: `Brand analysis completed for ${snapshot.brandName || input.project.name}.`,
      keySignals: [
        snapshot.industry || 'Unknown industry',
        snapshot.primaryAudience || 'Undefined audience',
        ...(snapshot.personalityTraits.length > 0 ? snapshot.personalityTraits : ['clear'])
      ],
      risks: [
        snapshot.uniqueSellingPoint ? 'Validate differentiation against market competitors.' : 'USP is still broad.',
        snapshot.preferredStyle.length > 1 ? 'Multiple style signals may need prioritization.' : 'Visual direction is concise.'
      ],
      positioning: snapshot.uniqueSellingPoint || 'Clear positioning pending refinement',
      recommendedBrief: {
        brandName: snapshot.brandName || input.project.name,
        industry: snapshot.industry || 'General',
        audience: snapshot.primaryAudience || 'Startup founders',
        personality: snapshot.personalityTraits.length > 0 ? snapshot.personalityTraits : ['modern', 'professional'],
        visualDirection: snapshot.preferredStyle.length > 0 ? snapshot.preferredStyle : ['minimal', 'modern']
      }
    }

    return {
      summary: output.summary,
      data: output,
      debug: {
        provider: 'mock',
        generatedAt: new Date().toISOString()
      }
    }
  },
  knowledge_specialist: async (input) => {
    const analysis = input.previousOutputs.brand_analyst as BrandAnalysisOutput | undefined
    const snapshot = getBrandFormSnapshot(input)
    const output: KnowledgeSpecialistOutput = {
      summary: `Knowledge layer prepared for ${snapshot.brandName || input.project.name}.`,
      brandVocabulary: [
        snapshot.brandName || input.project.name,
        snapshot.industry || 'brand',
        ...(analysis?.keySignals ?? [])
      ],
      designGuardrails: [
        'Keep the logo readable at small sizes.',
        'Avoid visual noise and unnecessary ornamentation.',
        ...(snapshot.preferredStyle.length > 0
          ? [`Prioritize ${snapshot.preferredStyle[0]} language.`]
          : [])
      ],
      keywords: [
        snapshot.uniqueSellingPoint,
        ...(snapshot.personalityTraits.length > 0 ? snapshot.personalityTraits : []),
        ...(snapshot.preferredColors.length > 0 ? snapshot.preferredColors : [])
      ].filter(Boolean),
      notes: [
        analysis?.positioning || 'Positioning is being refined.',
        snapshot.typographyPreference.length > 0
          ? `Typography preference: ${snapshot.typographyPreference[0]}`
          : 'Typography preference should prioritize clarity.'
      ]
    }

    return {
      summary: output.summary,
      data: output,
      debug: {
        provider: 'mock',
        generatedAt: new Date().toISOString()
      }
    }
  },
  creative_director: async (input) => {
    const snapshot = getBrandFormSnapshot(input)
    const knowledge = input.previousOutputs.knowledge_specialist as KnowledgeSpecialistOutput | undefined
    const baseStyle = snapshot.preferredStyle[0] || 'minimal'
    const palette = snapshot.preferredColors.length > 0 ? snapshot.preferredColors : ['black', 'white']
    const typography = snapshot.typographyPreference[0] || 'clean sans serif'

    const creativeDirections: CreativeDirectionItem[] = [
      {
        id: 'cd_01',
        title: `${baseStyle} monogram`,
        summary: 'A clean monogram-led direction with strong negative space.',
        rationale: 'Supports readability and premium simplicity.',
        visualDirection: [baseStyle, 'monogram', 'high contrast'],
        recommendedLogoType: snapshot.logoType || 'monogram',
        palette,
        typography
      },
      {
        id: 'cd_02',
        title: 'Structured symbol',
        summary: 'A symbol direction with precise geometry and minimal complexity.',
        rationale: 'Useful when the brand needs a mark that scales well across touchpoints.',
        visualDirection: ['geometric', 'balanced', 'iconic'],
        recommendedLogoType: snapshot.logoType || 'symbol',
        palette,
        typography
      },
      {
        id: 'cd_03',
        title: 'Refined wordmark',
        summary: 'A typographic direction focused on spacing, rhythm, and brand clarity.',
        rationale: 'Ideal when the name itself should carry the identity.',
        visualDirection: ['wordmark', 'spaced', 'editorial'],
        recommendedLogoType: snapshot.logoType || 'wordmark',
        palette,
        typography
      }
    ]

    const output: CreativeDirectorOutput = {
      summary: `Creative director prepared 3 directions for ${snapshot.brandName || input.project.name}.`,
      creativeDirections
    }

    return {
      summary: output.summary,
      data: {
        ...output,
        knowledgeReference: knowledge?.summary ?? null
      },
      debug: {
        provider: 'mock',
        generatedAt: new Date().toISOString()
      }
    }
  }
}
