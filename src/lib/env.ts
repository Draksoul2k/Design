type RequiredEnvKey =
  | 'NEXT_PUBLIC_APP_URL'
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'DATABASE_URL'
  | 'OPENAI_API_KEY'
  | 'GEMINI_API_KEY'
  | 'AGENTIVITY_API_KEY'

type OptionalEnvKey = 'OPENAI_IMAGE_MODEL'

export function getRequiredEnv(key: RequiredEnvKey): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

function getOptionalEnv(key: OptionalEnvKey): string | null {
  return process.env[key]?.trim() || null
}

export function getAppUrl(): string {
  return getRequiredEnv('NEXT_PUBLIC_APP_URL')
}

export function getSupabaseConfig() {
  return {
    url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }
}

export function getServiceRoleKey(): string {
  return getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
}

export function getDatabaseUrl(): string {
  return getRequiredEnv('DATABASE_URL')
}

export function getOpenAIImageModel(): string | null {
  return getOptionalEnv('OPENAI_IMAGE_MODEL')
}
