'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import {
  createProject,
  deleteProject,
  renameProject
} from '@/modules/projects/application/project.use-cases'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'

export type ProjectActionState = {
  status: 'idle' | 'error'
  message: string
}

const initialState: ProjectActionState = {
  status: 'idle',
  message: ''
}

function getStringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createProjectAction(
  _state: ProjectActionState = initialState,
  formData: FormData
): Promise<ProjectActionState> {
  void _state

  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  try {
    await createProject(projectRepository, user.id, getStringValue(formData, 'name'))
    revalidatePath('/dashboard')
    revalidatePath('/projects')
    redirect('/projects')
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể tạo project.'
    }
  }
}

export async function renameProjectAction(
  _state: ProjectActionState = initialState,
  formData: FormData
): Promise<ProjectActionState> {
  void _state

  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const projectId = getStringValue(formData, 'projectId')
  const name = getStringValue(formData, 'name')

  try {
    await renameProject(projectRepository, projectId, user.id, name)
    revalidatePath('/dashboard')
    revalidatePath('/projects')
    revalidatePath(`/projects/${projectId}/edit`)
    redirect('/projects')
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể cập nhật project.'
    }
  }
}

export async function deleteProjectAction(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const projectId = getStringValue(formData, 'projectId')

  try {
    await deleteProject(projectRepository, projectId, user.id)
    revalidatePath('/dashboard')
    revalidatePath('/projects')
    redirect('/projects')
  } catch {
    redirect('/projects?error=delete_failed')
  }
}
