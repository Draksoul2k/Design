import type { LogoAssetRecord, LogoPipelineSnapshot, LogoRecord } from '@/modules/logos/domain/logo'
import type { GeneratedLogoDraft } from '@/modules/logos/domain/logo'

export interface LogoRepository {
  storeGeneratedLogos(input: { items: GeneratedLogoDraft[] }): Promise<LogoPipelineSnapshot>
  listByProjectId(projectId: string): Promise<LogoPipelineSnapshot>
}

export type StoredLogoResult = {
  logo: LogoRecord
  asset: LogoAssetRecord | null
}

