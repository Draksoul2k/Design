export type ProjectId = string
export type UserId = string

export const PROJECT_NAME_MIN_LENGTH = 2
export const PROJECT_NAME_MAX_LENGTH = 80

export interface Project {
  id: ProjectId
  userId: UserId
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectInput {
  userId: UserId
  name: string
}

export function normalizeProjectName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function isProjectNameValid(value: string): boolean {
  return (
    value.length >= PROJECT_NAME_MIN_LENGTH &&
    value.length <= PROJECT_NAME_MAX_LENGTH
  )
}

