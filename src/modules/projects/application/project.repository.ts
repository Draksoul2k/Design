import type { CreateProjectInput, Project } from '@/modules/projects/domain/project'

export interface ProjectRepository {
  listByUserId(userId: string): Promise<Project[]>
  findOwnedById(projectId: string, userId: string): Promise<Project | null>
  create(input: CreateProjectInput): Promise<Project>
  rename(projectId: string, userId: string, name: string): Promise<Project | null>
  deleteById(projectId: string, userId: string): Promise<boolean>
}

