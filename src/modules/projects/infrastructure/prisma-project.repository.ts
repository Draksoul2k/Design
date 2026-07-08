import type {
  CreateProjectInput,
  Project
} from '@/modules/projects/domain/project'
import type { ProjectRepository } from '@/modules/projects/application/project.repository'
import { prisma } from '@/lib/prisma'

function mapProject(project: {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}): Project {
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  }
}

export class PrismaProjectRepository implements ProjectRepository {
  async listByUserId(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return projects.map(mapProject)
  }

  async findOwnedById(projectId: string, userId: string): Promise<Project | null> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    })

    return project ? mapProject(project) : null
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        userId: input.userId,
        name: input.name
      }
    })

    return mapProject(project)
  }

  async rename(
    projectId: string,
    userId: string,
    name: string
  ): Promise<Project | null> {
    try {
      const existingProject = await prisma.project.findFirst({
        where: { id: projectId, userId }
      })

      if (!existingProject) {
        return null
      }

      const project = await prisma.project.update({
        where: { id: projectId },
        data: { name }
      })

      return mapProject(project)
    } catch {
      return null
    }
  }

  async deleteById(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId }
      })

      if (!project) {
        return false
      }

      await prisma.project.delete({
        where: { id: projectId }
      })

      return true
    } catch {
      return false
    }
  }
}

export const projectRepository = new PrismaProjectRepository()
