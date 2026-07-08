import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type {
  WorkflowRepository,
  WorkflowRunRecord,
  WorkflowRunWithSteps,
  WorkflowStepRunRecord
} from '@/modules/workflow/application/workflow.repository'
import type {
  WorkflowRoleKey,
  WorkflowRunStatus,
  WorkflowStepStatus
} from '@/modules/workflow/domain/workflow'

type PrismaWorkflowRun = {
  id: string
  projectId: string
  initiatedByUserId: string
  status: string
  currentStep: string
  source: string
  inputJson: unknown
  outputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type PrismaWorkflowStepRun = {
  id: string
  workflowRunId: string
  roleKey: string
  roleLabel: string
  stepOrder: number
  status: string
  inputJson: unknown
  outputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapRun(record: PrismaWorkflowRun): WorkflowRunRecord {
  return {
    id: record.id,
    projectId: record.projectId,
    initiatedByUserId: record.initiatedByUserId,
    status: record.status as WorkflowRunStatus,
    currentStep: record.currentStep as WorkflowRoleKey,
    source: record.source,
    inputJson: record.inputJson,
    outputJson: record.outputJson,
    errorJson: record.errorJson,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

function mapStep(record: PrismaWorkflowStepRun): WorkflowStepRunRecord {
  return {
    id: record.id,
    workflowRunId: record.workflowRunId,
    roleKey: record.roleKey as WorkflowRoleKey,
    roleLabel: record.roleLabel,
    stepOrder: record.stepOrder,
    status: record.status as WorkflowStepStatus,
    inputJson: record.inputJson,
    outputJson: record.outputJson,
    errorJson: record.errorJson,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

function toNullableJsonValue(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
  return value === null ? Prisma.JsonNull : toJsonValue(value)
}

export class PrismaWorkflowRepository implements WorkflowRepository {
  async createRun(input: {
    projectId: string
    initiatedByUserId: string
    currentStep: WorkflowRoleKey
    source: string
    inputJson: unknown
    status?: WorkflowRunStatus
    startedAt?: Date | null
  }): Promise<WorkflowRunRecord> {
    const record = await prisma.workflowRun.create({
      data: {
        projectId: input.projectId,
        initiatedByUserId: input.initiatedByUserId,
        currentStep: input.currentStep,
        source: input.source,
        inputJson: toJsonValue(input.inputJson),
        status: input.status ?? 'pending',
        startedAt: input.startedAt ?? null
      }
    })

    return mapRun(record)
  }

  async updateRun(
    runId: string,
    data: Partial<{
      status: WorkflowRunStatus
      currentStep: WorkflowRoleKey
      outputJson: unknown
      errorJson: unknown
      startedAt: Date | null
      finishedAt: Date | null
    }>
  ): Promise<WorkflowRunRecord | null> {
    try {
      const record = await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          ...data,
          outputJson:
            data.outputJson === undefined ? undefined : toNullableJsonValue(data.outputJson),
          errorJson:
            data.errorJson === undefined ? undefined : toNullableJsonValue(data.errorJson)
        }
      })

      return mapRun(record)
    } catch {
      return null
    }
  }

  async createStepRun(input: {
    workflowRunId: string
    roleKey: WorkflowRoleKey
    roleLabel: string
    stepOrder: number
    inputJson: unknown
    status?: WorkflowStepStatus
    startedAt?: Date | null
  }): Promise<WorkflowStepRunRecord> {
    const record = await prisma.workflowStepRun.create({
      data: {
        workflowRunId: input.workflowRunId,
        roleKey: input.roleKey,
        roleLabel: input.roleLabel,
        stepOrder: input.stepOrder,
        inputJson: toJsonValue(input.inputJson),
        status: input.status ?? 'pending',
        startedAt: input.startedAt ?? null
      }
    })

    return mapStep(record)
  }

  async updateStepRun(
    stepRunId: string,
    data: Partial<{
      status: WorkflowStepStatus
      outputJson: unknown
      errorJson: unknown
      startedAt: Date | null
      finishedAt: Date | null
    }>
  ): Promise<WorkflowStepRunRecord | null> {
    try {
      const record = await prisma.workflowStepRun.update({
        where: { id: stepRunId },
        data: {
          ...data,
          outputJson:
            data.outputJson === undefined ? undefined : toNullableJsonValue(data.outputJson),
          errorJson:
            data.errorJson === undefined ? undefined : toNullableJsonValue(data.errorJson)
        }
      })

      return mapStep(record)
    } catch {
      return null
    }
  }

  async getLatestRunByProjectId(projectId: string): Promise<WorkflowRunWithSteps> {
    const run = await prisma.workflowRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    if (!run) {
      return { run: null, steps: [] }
    }

    const steps = await prisma.workflowStepRun.findMany({
      where: { workflowRunId: run.id },
      orderBy: { stepOrder: 'asc' }
    })

    return {
      run: mapRun(run),
      steps: steps.map(mapStep)
    }
  }

  async getTimelineByProjectId(projectId: string): Promise<WorkflowRunWithSteps> {
    return this.getLatestRunByProjectId(projectId)
  }
}

export const workflowRepository = new PrismaWorkflowRepository()
