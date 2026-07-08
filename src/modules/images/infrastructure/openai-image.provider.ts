import { getRequiredEnv } from '@/lib/env'
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageProvider
} from '@/modules/images/domain/image-provider'

function buildDataUrl(mimeType: string, base64Value: string | null | undefined): string | null {
  if (!base64Value) {
    return null
  }

  return `data:${mimeType};base64,${base64Value}`
}

export class OpenAIImageProvider implements ImageProvider {
  readonly providerKey = 'openai' as const

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const apiKey = getRequiredEnv('OPENAI_API_KEY')
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        size: request.size,
        n: 1,
        response_format: 'b64_json',
        style: request.style
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`OpenAI image generation failed: ${response.status} ${message}`)
    }

    const payload = (await response.json()) as {
      data?: Array<{
        b64_json?: string
        url?: string
        revised_prompt?: string
      }>
      usage?: unknown
    }

    const first = payload.data?.[0]
    const dataUrl = buildDataUrl('image/png', first?.b64_json ?? null)
    const sourceUrl = first?.url ?? null

    if (!dataUrl && !sourceUrl) {
      throw new Error('OpenAI image provider returned no usable image asset.')
    }

    return {
      provider: this.providerKey,
      model: request.model,
      mimeType: 'image/png',
      dataUrl,
      sourceUrl,
      revisedPrompt: first?.revised_prompt ?? null,
      usage: payload.usage ?? null,
      rawResponse: payload
    }
  }
}

export const openAiImageProvider = new OpenAIImageProvider()
