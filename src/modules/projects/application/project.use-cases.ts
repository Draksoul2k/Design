import type { ProjectRepository } from '@/modules/projects/application/project.repository'
import {
  isProjectNameValid,
  normalizeProjectName
} from '@/modules/projects/domain/project'

export async function listProjects(repo: ProjectRepository, userId: string) {
  return repo.listByUserId(userId)
}

export async function getProject(
  repo: ProjectRepository,
  projectId: string,
  userId: string
) {
  return repo.findOwnedById(projectId, userId)
}

export async function createProject(
  repo: ProjectRepository,
  userId: string,
  name: string
) {
  const normalizedName = normalizeProjectName(name)

  if (!isProjectNameValid(normalizedName)) {
    throw new Error(
      `Tên project phải từ 2 đến 80 ký tự.`
    )
  }

  return repo.create({
    userId,
    name: normalizedName
  })
}

export async function renameProject(
  repo: ProjectRepository,
  projectId: string,
  userId: string,
  name: string
) {
  const normalizedName = normalizeProjectName(name)

  if (!isProjectNameValid(normalizedName)) {
    throw new Error(
      `Tên project phải từ 2 đến 80 ký tự.`
    )
  }

  const updatedProject = await repo.rename(projectId, userId, normalizedName)

  if (!updatedProject) {
    throw new Error('Project không tồn tại hoặc bạn không có quyền chỉnh sửa.')
  }

  return updatedProject
}

export async function deleteProject(
  repo: ProjectRepository,
  projectId: string,
  userId: string
) {
  const deleted = await repo.deleteById(projectId, userId)

  if (!deleted) {
    throw new Error('Project không tồn tại hoặc bạn không có quyền xoá.')
  }

  return deleted
}

