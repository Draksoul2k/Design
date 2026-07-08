export type ImageProviderKey = 'openai'

export type ImageGenerationRequest = {
  prompt: string
  model: string
  size: '1024x1024'
  style: 'vivid' | 'natural'
}

export type ImageGenerationResult = {
  provider: ImageProviderKey
  model: string
  mimeType: string
  dataUrl: string | null
  sourceUrl: string | null
  revisedPrompt: string | null
  usage: unknown | null
  rawResponse: unknown
}

export interface ImageProvider {
  readonly providerKey: ImageProviderKey
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>
}
