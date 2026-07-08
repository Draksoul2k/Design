export const BRAND_FORM_STEP_IDS = [
  'basic_information',
  'business_information',
  'target_audience',
  'brand_personality',
  'brand_values',
  'visual_preferences',
  'logo_references',
  'things_to_avoid',
  'ai_summary'
] as const

export type BrandFormStepId = (typeof BRAND_FORM_STEP_IDS)[number]

export const BRAND_FORM_STEPS: Array<{
  id: BrandFormStepId
  label: string
}> = [
  { id: 'basic_information', label: 'Basic Information' },
  { id: 'business_information', label: 'Business Information' },
  { id: 'target_audience', label: 'Target Audience' },
  { id: 'brand_personality', label: 'Brand Personality' },
  { id: 'brand_values', label: 'Brand Values' },
  { id: 'visual_preferences', label: 'Visual Preferences' },
  { id: 'logo_references', label: 'Logo References' },
  { id: 'things_to_avoid', label: 'Things to Avoid' },
  { id: 'ai_summary', label: 'AI Summary' }
]

export type BrandFormValues = {
  brandName: string
  tagline: string
  industry: string
  market: string
  language: string
  productService: string
  businessModel: string
  uniqueSellingPoint: string
  originStory: string
  mainBusinessGoal: string
  primaryAudience: string
  ageRange: string
  genderFocus: string
  incomeLevel: string
  professionRole: string
  audiencePainPoints: string
  audienceExpectations: string
  personalityTraits: string[]
  toneOfVoice: string[]
  brandArchetype: string
  emotionToConvey: string[]
  adjectives: string
  coreValues: string
  mission: string
  vision: string
  brandPromise: string
  brandStandsFor: string
  preferredStyle: string[]
  preferredColors: string[]
  avoidColors: string[]
  typographyPreference: string[]
  shapePreference: string[]
  logoType: string
  referenceLinks: string
  referenceLikes: string
  referenceDislikes: string
  referenceNotes: string
  avoidElements: string
  avoidStyles: string
  avoidSymbols: string
  competitorWarnings: string
}

export type BrandFormSummary = {
  summary: string
  positioning: string
  creativeDirection: string
  recommendedLogoType: string
  recommendedColors: string[]
  recommendedTypography: string
  strengths: string[]
  cautions: string[]
  keywords: string[]
}

export const DEFAULT_BRAND_FORM_VALUES: BrandFormValues = {
  brandName: '',
  tagline: '',
  industry: '',
  market: '',
  language: 'Vietnamese',
  productService: '',
  businessModel: '',
  uniqueSellingPoint: '',
  originStory: '',
  mainBusinessGoal: '',
  primaryAudience: '',
  ageRange: '',
  genderFocus: '',
  incomeLevel: '',
  professionRole: '',
  audiencePainPoints: '',
  audienceExpectations: '',
  personalityTraits: [],
  toneOfVoice: [],
  brandArchetype: '',
  emotionToConvey: [],
  adjectives: '',
  coreValues: '',
  mission: '',
  vision: '',
  brandPromise: '',
  brandStandsFor: '',
  preferredStyle: [],
  preferredColors: [],
  avoidColors: [],
  typographyPreference: [],
  shapePreference: [],
  logoType: '',
  referenceLinks: '',
  referenceLikes: '',
  referenceDislikes: '',
  referenceNotes: '',
  avoidElements: '',
  avoidStyles: '',
  avoidSymbols: '',
  competitorWarnings: ''
}

export const BASIC_INFORMATION_FIELDS: Array<keyof BrandFormValues> = [
  'brandName',
  'tagline',
  'industry',
  'market',
  'language'
]

export const BUSINESS_INFORMATION_FIELDS: Array<keyof BrandFormValues> = [
  'productService',
  'businessModel',
  'uniqueSellingPoint',
  'originStory',
  'mainBusinessGoal'
]

export const TARGET_AUDIENCE_FIELDS: Array<keyof BrandFormValues> = [
  'primaryAudience',
  'ageRange',
  'genderFocus',
  'incomeLevel',
  'professionRole',
  'audiencePainPoints',
  'audienceExpectations'
]

export const BRAND_PERSONALITY_FIELDS: Array<keyof BrandFormValues> = [
  'personalityTraits',
  'toneOfVoice',
  'brandArchetype',
  'emotionToConvey',
  'adjectives'
]

export const BRAND_VALUES_FIELDS: Array<keyof BrandFormValues> = [
  'coreValues',
  'mission',
  'vision',
  'brandPromise',
  'brandStandsFor'
]

export const VISUAL_PREFERENCES_FIELDS: Array<keyof BrandFormValues> = [
  'preferredStyle',
  'preferredColors',
  'avoidColors',
  'typographyPreference',
  'shapePreference',
  'logoType'
]

export const LOGO_REFERENCES_FIELDS: Array<keyof BrandFormValues> = [
  'referenceLinks',
  'referenceLikes',
  'referenceDislikes',
  'referenceNotes'
]

export const THINGS_TO_AVOID_FIELDS: Array<keyof BrandFormValues> = [
  'avoidElements',
  'avoidStyles',
  'avoidSymbols',
  'competitorWarnings'
]

export function getFieldsForStep(stepId: BrandFormStepId): Array<keyof BrandFormValues> {
  switch (stepId) {
    case 'basic_information':
      return BASIC_INFORMATION_FIELDS
    case 'business_information':
      return BUSINESS_INFORMATION_FIELDS
    case 'target_audience':
      return TARGET_AUDIENCE_FIELDS
    case 'brand_personality':
      return BRAND_PERSONALITY_FIELDS
    case 'brand_values':
      return BRAND_VALUES_FIELDS
    case 'visual_preferences':
      return VISUAL_PREFERENCES_FIELDS
    case 'logo_references':
      return LOGO_REFERENCES_FIELDS
    case 'things_to_avoid':
      return THINGS_TO_AVOID_FIELDS
    case 'ai_summary':
      return []
  }
}

export function getStepIndex(stepId: BrandFormStepId): number {
  return BRAND_FORM_STEPS.findIndex((step) => step.id === stepId)
}

export function parseListFromText(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinListToText(values: string[]): string {
  return values.join(', ')
}

export function hasEnoughBrandData(values: BrandFormValues): boolean {
  return Boolean(values.brandName.trim() && values.industry.trim() && values.productService.trim())
}

export function buildMockBrandSummary(values: BrandFormValues): BrandFormSummary {
  const keywords = [
    values.brandName,
    values.industry,
    ...values.personalityTraits,
    ...values.preferredStyle
  ].filter(Boolean)

  const recommendedLogoType = values.logoType || 'Combination mark'
  const recommendedColors =
    values.preferredColors.length > 0 ? values.preferredColors : ['Black', 'White']
  const recommendedTypography =
    values.typographyPreference[0] || 'Clean sans serif with strong readability'

  return {
    summary: `${values.brandName || 'The brand'} should feel ${values.personalityTraits.join(
      ', '
    ) || 'clear and professional'} with a ${values.preferredStyle.join(', ') || 'minimal'} visual language.`,
    positioning: values.uniqueSellingPoint || 'Differentiated brand positioning',
    creativeDirection:
      values.preferredStyle[0] ||
      values.brandArchetype ||
      'Minimal premium direction with clear brand presence',
    recommendedLogoType,
    recommendedColors,
    recommendedTypography,
    strengths: [
      values.uniqueSellingPoint || 'Strong unique selling point',
      values.mainBusinessGoal || 'Clear business goal',
      values.personalityTraits.join(', ') || 'Defined brand personality'
    ].filter(Boolean),
    cautions: [
      values.avoidStyles ? `Avoid styles: ${values.avoidStyles}` : 'Keep the design consistent',
      values.competitorWarnings || 'Check differentiation against competitors'
    ].filter(Boolean),
    keywords
  }
}

