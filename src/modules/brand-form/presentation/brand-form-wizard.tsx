'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Check, ChevronLeft, ChevronRight, Loader2, Lock, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  BRAND_FORM_STEPS,
  DEFAULT_BRAND_FORM_VALUES,
  type BrandFormStepId,
  type BrandFormValues,
  getFieldsForStep,
  getStepIndex
} from '@/modules/brand-form/domain/brand-form'
import {
  confirmBrandFormAction,
  saveBrandFormDraftAction
} from '@/modules/brand-form/presentation/brand-form.actions'

const multiSelectOptions = {
  personalityTraits: ['modern', 'premium', 'clear', 'trustworthy', 'bold', 'elegant', 'friendly', 'creative'],
  toneOfVoice: ['professional', 'warm', 'confident', 'playful', 'minimal', 'high-end'],
  emotionToConvey: ['trust', 'confidence', 'clarity', 'luxury', 'innovation', 'warmth'],
  preferredStyle: ['minimal', 'modern', 'luxury', 'abstract', 'mascot', 'vintage'],
  preferredColors: ['black', 'white', 'gold', 'navy', 'green', 'blue', 'silver'],
  avoidColors: ['pink', 'neon', 'red', 'orange', 'brown'],
  typographyPreference: ['sans serif', 'serif', 'geometric', 'humanist', 'custom lettering'],
  shapePreference: ['circle', 'square', 'monogram', 'abstract', 'shield', 'wordmark']
} as const

type BrandFormWizardProps = {
  projectId: string
  projectName: string
  initialValues?: BrandFormValues
  initialStep?: BrandFormStepId
  initialStatus?: string
  initialSummary?: {
    summary: string
    positioning: string
    creativeDirection: string
    recommendedLogoType: string
    recommendedColors: string[]
    recommendedTypography: string
    strengths: string[]
    cautions: string[]
    keywords: string[]
  } | null
}

function StepChipGroup({
  label,
  value,
  options,
  onChange,
  required
}: {
  label: string
  value: string[]
  options: readonly string[]
  onChange: (next: string[]) => void
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        {required ? <span className="text-xs text-muted-foreground">Required</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                selected
                  ? onChange(value.filter((item) => item !== option))
                  : onChange([...value, option])
              }
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepSection({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children, hint }: {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        {required ? <span className="text-xs text-muted-foreground">Required</span> : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function BrandFormWizard({
  projectId,
  projectName,
  initialValues = DEFAULT_BRAND_FORM_VALUES,
  initialStep = 'basic_information',
  initialStatus = 'draft',
  initialSummary = null
}: BrandFormWizardProps) {
  const [activeStep, setActiveStep] = useState<BrandFormStepId>(initialStep)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [summaryState, setSummaryState] = useState(initialSummary)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const router = useRouter()
  const {
    register,
    control,
    getValues,
    setError,
    clearErrors,
    trigger,
    watch,
    formState: { errors, isDirty }
  } = useForm<BrandFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur'
  })

  const values = watch()
  const stepIndex = getStepIndex(activeStep)
  const currentStepFields = useMemo(() => getFieldsForStep(activeStep), [activeStep])
  const autosaveTimerRef = useRef<number | null>(null)
  const lastSavedSnapshotRef = useRef<string>(JSON.stringify(initialValues))

  const progress = ((stepIndex + 1) / BRAND_FORM_STEPS.length) * 100
  const isSummaryStep = activeStep === 'ai_summary'

  useEffect(() => {
    if (!isDirty) {
      return
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = window.setTimeout(async () => {
      const snapshot = JSON.stringify(getValues())

      if (snapshot === lastSavedSnapshotRef.current) {
        return
      }

      setSaveState('saving')
      const response = await saveBrandFormDraftAction({
        projectId,
        currentStep: activeStep,
        formData: getValues()
      })

      if (response.status === 'error') {
        setSaveState('error')
        setSaveMessage(response.message)
        return
      }

      lastSavedSnapshotRef.current = snapshot
      setSaveState('saved')
      setSaveMessage(response.message)
    }, 1000)

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [activeStep, getValues, initialSummary, isDirty, projectId, values])

  useEffect(() => {
    setSummaryState(initialSummary)
  }, [initialSummary])

  async function persistCurrentStep(nextStep?: BrandFormStepId) {
    const response = await saveBrandFormDraftAction({
      projectId,
      currentStep: nextStep ?? activeStep,
      formData: getValues()
    })

    if (response.status === 'error') {
      setSaveState('error')
      setSaveMessage(response.message)
      return false
    }

    setSaveState('saved')
    setSaveMessage(response.message)
    lastSavedSnapshotRef.current = JSON.stringify(getValues())
    return true
  }

  function validateCurrentStep(): boolean {
    clearErrors()
    const stepFields = currentStepFields
    let ok = true

    for (const fieldName of stepFields) {
      const value = getValues(fieldName)
      if (Array.isArray(value)) {
        if (value.length === 0) {
          setError(fieldName, { type: 'manual', message: 'Vui lòng chọn ít nhất một giá trị.' })
          ok = false
        }
      } else if (typeof value === 'string' && !value.trim()) {
        const requiredFields = new Set([
          'brandName',
          'industry',
          'language',
          'productService',
          'uniqueSellingPoint',
          'mainBusinessGoal',
          'primaryAudience',
          'audiencePainPoints',
          'audienceExpectations',
          'personalityTraits',
          'emotionToConvey',
          'coreValues',
          'preferredStyle',
          'preferredColors',
          'logoType'
        ])

        if (requiredFields.has(String(fieldName))) {
          setError(fieldName, { type: 'manual', message: 'Trường này là bắt buộc.' })
          ok = false
        }
      }
    }

    if (activeStep === 'brand_personality' && getValues('personalityTraits').length === 0) {
      setError('personalityTraits', { type: 'manual', message: 'Chọn ít nhất một personality trait.' })
      ok = false
    }

    if (activeStep === 'visual_preferences' && getValues('preferredStyle').length === 0) {
      setError('preferredStyle', { type: 'manual', message: 'Chọn ít nhất một style.' })
      ok = false
    }

    return ok
  }

  async function goNext() {
    const valid = await trigger(getFieldsForStep(activeStep) as Array<keyof BrandFormValues>)

    if (!valid || !validateCurrentStep()) {
      return
    }

    const currentIndex = getStepIndex(activeStep)
    const nextStep = BRAND_FORM_STEPS[Math.min(currentIndex + 1, BRAND_FORM_STEPS.length - 1)]?.id ?? activeStep

    const saved = await persistCurrentStep(nextStep)

    if (!saved) {
      return
    }

    if (nextStep !== activeStep) {
      setActiveStep(nextStep)
    }
  }

  async function goPrevious() {
    const currentIndex = getStepIndex(activeStep)
    const prevStep = BRAND_FORM_STEPS[Math.max(0, currentIndex - 1)]?.id ?? activeStep

    const saved = await persistCurrentStep(prevStep)

    if (!saved) {
      return
    }

    if (prevStep !== activeStep) {
      setActiveStep(prevStep)
    }
  }

  async function handleConfirm() {
    const allFields = BRAND_FORM_STEPS.flatMap((step) => getFieldsForStep(step.id))
    const valid = await trigger(allFields as Array<keyof BrandFormValues>)

    if (!valid || !validateCurrentStep()) {
      setActiveStep('ai_summary')
      return
    }

    setIsFinalizing(true)
    const response = await confirmBrandFormAction({
      projectId,
      formData: getValues()
    })
    setIsFinalizing(false)

    if (response.status === 'error') {
      setSaveState('error')
      setSaveMessage(response.message)
      return
    }

    setSummaryState(buildMockSummaryFromValues(getValues()))
    setSaveState('saved')
    setSaveMessage('Brand form đã được khóa để chờ workflow bước tiếp theo.')
    router.push(`/projects/${projectId}`)
  }

  function buildMockSummaryFromValues(currentValues: BrandFormValues) {
    return {
      summary: `${currentValues.brandName || 'The brand'} is positioned for ${currentValues.industry || 'its market'} with a ${currentValues.preferredStyle.join(', ') || 'minimal'} tone.`,
      positioning: currentValues.uniqueSellingPoint || 'Clear value proposition',
      creativeDirection: currentValues.preferredStyle[0] || 'Minimal premium direction',
      recommendedLogoType: currentValues.logoType || 'Combination mark',
      recommendedColors:
        currentValues.preferredColors.length > 0 ? currentValues.preferredColors : ['Black', 'White'],
      recommendedTypography:
        currentValues.typographyPreference[0] || 'Clean sans serif with high readability',
      strengths: [
        currentValues.uniqueSellingPoint,
        currentValues.mainBusinessGoal,
        currentValues.personalityTraits.join(', ')
      ].filter(Boolean),
      cautions: [
        currentValues.avoidStyles || 'Maintain visual consistency',
        currentValues.competitorWarnings || 'Review differentiation'
      ].filter(Boolean),
      keywords: [
        currentValues.brandName,
        currentValues.industry,
        ...currentValues.personalityTraits,
        ...currentValues.preferredStyle
      ].filter(Boolean)
    }
  }

  const summaryPreview =
    summaryState ?? buildMockSummaryFromValues(values)

  function renderCurrentStep() {
    switch (activeStep) {
      case 'basic_information':
        return (
          <StepSection
            title="Basic Information"
            description="Thông tin nền tảng để AI hiểu tên thương hiệu và thị trường."
          >
            <Field label="Brand Name" required hint="Tên thương hiệu sẽ xuất hiện trên logo.">
              <Input {...register('brandName')} placeholder="Nova Studio" />
              {errors.brandName ? <p className="text-xs text-destructive">{errors.brandName.message}</p> : null}
            </Field>
            <Field label="Tagline / Slogan" hint="Không bắt buộc.">
              <Input {...register('tagline')} placeholder="Design with clarity" />
            </Field>
            <Field label="Industry" required hint="Chọn ngành gần nhất với business của bạn.">
              <Input {...register('industry')} placeholder="Design Agency" />
              {errors.industry ? <p className="text-xs text-destructive">{errors.industry.message}</p> : null}
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Country / Market" hint="Thị trường chính.">
                <Input {...register('market')} placeholder="Vietnam / Global" />
              </Field>
              <Field label="Language of Brand" required>
                <Select {...register('language')}>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="English">English</option>
                  <option value="Bilingual">Bilingual</option>
                </Select>
              </Field>
            </div>
          </StepSection>
        )
      case 'business_information':
        return (
          <StepSection
            title="Business Information"
            description="Doanh nghiệp bán gì, khác biệt ở đâu, và mục tiêu chính là gì."
          >
            <Field label="Product / Service" required>
              <Textarea {...register('productService')} placeholder="We design premium branding systems..." />
              {errors.productService ? (
                <p className="text-xs text-destructive">{errors.productService.message}</p>
              ) : null}
            </Field>
            <Field label="Business Model" hint="Ví dụ: agency, SaaS, studio, retail...">
              <Input {...register('businessModel')} placeholder="Agency" />
            </Field>
            <Field label="Unique Selling Point" required>
              <Textarea {...register('uniqueSellingPoint')} placeholder="What makes you different?" />
              {errors.uniqueSellingPoint ? (
                <p className="text-xs text-destructive">{errors.uniqueSellingPoint.message}</p>
              ) : null}
            </Field>
            <Field label="Brand Origin Story" hint="Câu chuyện ngắn về thương hiệu.">
              <Textarea {...register('originStory')} placeholder="How did the brand start?" />
            </Field>
            <Field label="Main Business Goal" required>
              <Input {...register('mainBusinessGoal')} placeholder="Premium brand recognition" />
              {errors.mainBusinessGoal ? (
                <p className="text-xs text-destructive">{errors.mainBusinessGoal.message}</p>
              ) : null}
            </Field>
          </StepSection>
        )
      case 'target_audience':
        return (
          <StepSection
            title="Target Audience"
            description="Xác định logo cần nói chuyện với ai."
          >
            <Field label="Primary Audience" required>
              <Textarea {...register('primaryAudience')} placeholder="Startup founders, tech entrepreneurs..." />
              {errors.primaryAudience ? (
                <p className="text-xs text-destructive">{errors.primaryAudience.message}</p>
              ) : null}
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Age Range">
                <Select {...register('ageRange')}>
                  <option value="">Select</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </Select>
              </Field>
              <Field label="Gender Focus">
                <Select {...register('genderFocus')}>
                  <option value="">Select</option>
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Income / Budget Level">
                <Select {...register('incomeLevel')}>
                  <option value="">Select</option>
                  <option value="budget">Budget</option>
                  <option value="mid">Mid</option>
                  <option value="premium">Premium</option>
                </Select>
              </Field>
              <Field label="Profession / Role">
                <Input {...register('professionRole')} placeholder="Founders, owners, managers..." />
              </Field>
            </div>
            <Field label="Audience Pain Points" required>
              <Textarea {...register('audiencePainPoints')} placeholder="What problem do they need solved?" />
              {errors.audiencePainPoints ? (
                <p className="text-xs text-destructive">{errors.audiencePainPoints.message}</p>
              ) : null}
            </Field>
            <Field label="Audience Expectations" required>
              <Textarea {...register('audienceExpectations')} placeholder="What do they expect from the brand?" />
              {errors.audienceExpectations ? (
                <p className="text-xs text-destructive">{errors.audienceExpectations.message}</p>
              ) : null}
            </Field>
          </StepSection>
        )
      case 'brand_personality':
        return (
          <StepSection
            title="Brand Personality"
            description="Tính cách thương hiệu giúp AI chọn ngôn ngữ hình ảnh chính xác hơn."
          >
            <Controller
              control={control}
              name="personalityTraits"
              rules={{ validate: (value) => value.length > 0 || 'Chọn ít nhất một tính cách.' }}
              render={({ field }) => (
                <StepChipGroup
                  label="Personality Traits"
                  value={field.value}
                  options={multiSelectOptions.personalityTraits}
                  onChange={field.onChange}
                  required
                />
              )}
            />
            {errors.personalityTraits ? (
              <p className="text-xs text-destructive">{errors.personalityTraits.message as string}</p>
            ) : null}
            <Controller
              control={control}
              name="toneOfVoice"
              render={({ field }) => (
                <StepChipGroup
                  label="Tone of Voice"
                  value={field.value}
                  options={multiSelectOptions.toneOfVoice}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand Archetype">
                <Select {...register('brandArchetype')}>
                  <option value="">Select</option>
                  <option value="hero">Hero</option>
                  <option value="sage">Sage</option>
                  <option value="creator">Creator</option>
                  <option value="magician">Magician</option>
                  <option value="ruler">Ruler</option>
                  <option value="explorer">Explorer</option>
                </Select>
              </Field>
              <Controller
                control={control}
                name="emotionToConvey"
                rules={{ validate: (value) => value.length > 0 || 'Chọn ít nhất một cảm xúc.' }}
                render={({ field }) => (
                  <StepChipGroup
                    label="Emotion to Convey"
                    value={field.value}
                    options={multiSelectOptions.emotionToConvey}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
            </div>
            <Field label="3 Adjectives" hint="Tách bằng dấu phẩy hoặc xuống dòng.">
              <Textarea {...register('adjectives')} placeholder="modern, premium, clean" />
            </Field>
          </StepSection>
        )
      case 'brand_values':
        return (
          <StepSection
            title="Brand Values"
            description="Giá trị cốt lõi và lời hứa thương hiệu."
          >
            <Field label="Core Values" required>
              <Textarea {...register('coreValues')} placeholder="clarity, trust, craftsmanship" />
              {errors.coreValues ? <p className="text-xs text-destructive">{errors.coreValues.message}</p> : null}
            </Field>
            <Field label="Mission">
              <Textarea {...register('mission')} placeholder="What is the mission?" />
            </Field>
            <Field label="Vision">
              <Textarea {...register('vision')} placeholder="What is the long-term vision?" />
            </Field>
            <Field label="Brand Promise">
              <Textarea {...register('brandPromise')} placeholder="What promise do you make to clients?" />
            </Field>
            <Field label="What the Brand Stands For">
              <Textarea {...register('brandStandsFor')} placeholder="What does the brand represent?" />
            </Field>
          </StepSection>
        )
      case 'visual_preferences':
        return (
          <StepSection
            title="Visual Preferences"
            description="Hướng hình ảnh, màu sắc và phong cách logo."
          >
            <Controller
              control={control}
              name="preferredStyle"
              rules={{ validate: (value) => value.length > 0 || 'Chọn ít nhất một style.' }}
              render={({ field }) => (
                <StepChipGroup
                  label="Preferred Style"
                  value={field.value}
                  options={multiSelectOptions.preferredStyle}
                  onChange={field.onChange}
                  required
                />
              )}
            />
            {errors.preferredStyle ? (
              <p className="text-xs text-destructive">{errors.preferredStyle.message as string}</p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="preferredColors"
                rules={{ validate: (value) => value.length > 0 || 'Chọn ít nhất một màu.' }}
                render={({ field }) => (
                  <StepChipGroup
                    label="Preferred Colors"
                    value={field.value}
                    options={multiSelectOptions.preferredColors}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="avoidColors"
                render={({ field }) => (
                  <StepChipGroup
                    label="Avoid Colors"
                    value={field.value}
                    options={multiSelectOptions.avoidColors}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="typographyPreference"
                render={({ field }) => (
                  <StepChipGroup
                    label="Typography Preference"
                    value={field.value}
                    options={multiSelectOptions.typographyPreference}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="shapePreference"
                render={({ field }) => (
                  <StepChipGroup
                    label="Shape Preference"
                    value={field.value}
                    options={multiSelectOptions.shapePreference}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <Field label="Logo Type" required>
              <Select {...register('logoType')}>
                <option value="">Select</option>
                <option value="wordmark">Wordmark</option>
                <option value="lettermark">Lettermark</option>
                <option value="monogram">Monogram</option>
                <option value="symbol">Symbol</option>
                <option value="combination mark">Combination mark</option>
              </Select>
              {errors.logoType ? <p className="text-xs text-destructive">{errors.logoType.message}</p> : null}
            </Field>
          </StepSection>
        )
      case 'logo_references':
        return (
          <StepSection
            title="Logo References"
            description="Tham chiếu để AI hiểu gu thẩm mỹ hoặc tránh lệch hướng."
          >
            <Field label="Reference Links" hint="Dán link logo, board, Pinterest hoặc website tham chiếu.">
              <Textarea {...register('referenceLinks')} placeholder="https://..." />
            </Field>
            <Field label="Reference Logos Like">
              <Textarea {...register('referenceLikes')} placeholder="What do you like about them?" />
            </Field>
            <Field label="Reference Logos Dislike">
              <Textarea {...register('referenceDislikes')} placeholder="What do you want to avoid?" />
            </Field>
            <Field label="Reference Notes">
              <Textarea {...register('referenceNotes')} placeholder="Additional reference notes" />
            </Field>
          </StepSection>
        )
      case 'things_to_avoid':
        return (
          <StepSection
            title="Things to Avoid"
            description="Các yếu tố không nên xuất hiện trong logo."
          >
            <Field label="Visual Elements to Avoid">
              <Textarea {...register('avoidElements')} placeholder="crowded shapes, cartoon icons..." />
            </Field>
            <Field label="Styles to Avoid">
              <Textarea {...register('avoidStyles')} placeholder="playful, noisy, overly complex..." />
            </Field>
            <Field label="Symbols to Avoid">
              <Textarea {...register('avoidSymbols')} placeholder="arrows, crowns, generic buildings..." />
            </Field>
            <Field label="Competitor Similarity Warnings">
              <Textarea {...register('competitorWarnings')} placeholder="Brands or patterns to avoid resembling" />
            </Field>
          </StepSection>
        )
      case 'ai_summary':
        return (
          <div className="space-y-6">
            <StepSection
              title="AI Summary"
              description="Mock AI summary được tạo từ dữ liệu bạn đã nhập. Sprint sau sẽ thay bằng Gemini."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardDescription>Positioning</CardDescription>
                    <CardTitle className="text-lg">{summaryPreview.positioning ?? '—'}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardDescription>Creative Direction</CardDescription>
                    <CardTitle className="text-lg">{summaryPreview.creativeDirection ?? '—'}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Card className="border-border/60">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Summary</h4>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {summaryPreview.summary ??
                        'We will generate a mock summary from your form data once enough information is available.'}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold">Strengths</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {(summaryPreview.strengths ?? []).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Cautions</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {(summaryPreview.cautions ?? []).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-semibold">Recommended Logo Type</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {summaryPreview.recommendedLogoType ?? '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Recommended Typography</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {summaryPreview.recommendedTypography ?? '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Recommended Colors</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {(summaryPreview.recommendedColors ?? []).join(', ') || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-muted/20">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4 text-primary" />
                    Review all information before generate
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sprint 2 stops here. In the next sprint, the confirmed brief will flow into the AI workflow.
                  </p>
                  <Button type="button" onClick={handleConfirm} disabled={isFinalizing} className="w-full sm:w-auto">
                    {isFinalizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Xác nhận & Khóa Brand Form
                  </Button>
                </CardContent>
              </Card>
            </StepSection>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">All Input Summary</CardTitle>
                <CardDescription>Xem nhanh toàn bộ dữ liệu đã nhập trước khi chốt.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ['Basic Information', [values.brandName, values.industry, values.language].filter(Boolean).join(' · ')],
                  ['Business Information', [values.productService, values.uniqueSellingPoint].filter(Boolean).join(' · ')],
                  ['Target Audience', [values.primaryAudience, values.audiencePainPoints].filter(Boolean).join(' · ')],
                  ['Personality', [values.personalityTraits.join(', '), values.emotionToConvey.join(', ')].filter(Boolean).join(' · ')],
                  ['Values', [values.coreValues, values.brandPromise].filter(Boolean).join(' · ')],
                  ['Visual Preferences', [values.preferredStyle.join(', '), values.preferredColors.join(', ')].filter(Boolean).join(' · ')],
                  ['References', [values.referenceLinks, values.referenceLikes].filter(Boolean).join(' · ')],
                  ['Avoid', [values.avoidElements, values.avoidStyles].filter(Boolean).join(' · ')]
                ].map(([title, content]) => (
                  <div key={String(title)} className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{String(title)}</p>
                    <p className="mt-2 text-sm">{String(content) || '—'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project</p>
            <h1 className="text-3xl font-semibold tracking-tight">{projectName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Brand Form flow with autosave and resume support.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-2 text-sm">
            <Save className="h-4 w-4 text-primary" />
            {saveState === 'saving'
              ? 'Saving...'
              : saveState === 'saved'
                ? 'Saved'
                : saveState === 'error'
                  ? 'Save error'
                  : initialStatus}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>
              Step {stepIndex + 1} / {BRAND_FORM_STEPS.length}
            </span>
            <span>{BRAND_FORM_STEPS[stepIndex]?.label}</span>
          </div>
          <Progress value={progress} />
          <div className="flex flex-wrap gap-2 pt-2">
            {BRAND_FORM_STEPS.map((step, index) => {
              const active = step.id === activeStep
              const completed = index < stepIndex || (initialStatus === 'completed' && step.id !== activeStep)

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : completed
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardContent className="space-y-6 p-6">
          {renderCurrentStep()}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {saveMessage ? saveMessage : 'Autosave will keep your progress synced to the database.'}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={goPrevious} disabled={stepIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {isSummaryStep ? null : (
                <Button type="button" onClick={goNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
