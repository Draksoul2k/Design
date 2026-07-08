import type { WorkflowRoleKey, WorkflowRunStatus, WorkflowStepStatus } from '@/modules/workflow/domain/workflow'

export type WorkflowRunRecord = {
  id: string
  projectId: string
  initiatedByUserId: string
  status: WorkflowRunStatus
  currentStep: WorkflowRoleKey
  source: string
  inputJson: unknown
  outputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type WorkflowStepRunRecord = {
  id: string
  workflowRunId: string
  roleKey: WorkflowRoleKey
  roleLabel: string
  stepOrder: number
  status: WorkflowStepStatus
  inputJson: unknown
  outputJson: unknown
  errorJson: unknown
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type WorkflowRunWithSteps = {
  run: WorkflowRunRecord | null
  steps: WorkflowStepRunRecord[]
}

export interface WorkflowRepository {
  createRun(input: {
    projectId: string
    initiatedByUserId: string
    currentStep: WorkflowRoleKey
    source: string
    inputJson: unknown
    status?: WorkflowRunStatus
    startedAt?: Date | null
  }): Promise<WorkflowRunRecord>
  updateRun(
    runId: string,
    data: Partial<{
      status: WorkflowRunStatus
      currentStep: WorkflowRoleKey
      outputJson: unknown
      errorJson: unknown
      startedAt: Date | null
      finishedAt: Date | null
    }>
  ): Promise<WorkflowRunRecord | null>
  createStepRun(input: {
    workflowRunId: string
    roleKey: WorkflowRoleKey
    roleLabel: string
    stepOrder: number
    inputJson: unknown
    status?: WorkflowStepStatus
    startedAt?: Date | null
  }): Promise<WorkflowStepRunRecord>
  updateStepRun(
    stepRunId: string,
    data: Partial<{
      status: WorkflowStepStatus
      outputJson: unknown
      errorJson: unknown
      startedAt: Date | null
      finishedAt: Date | null
    }>
  ): Promise<WorkflowStepRunRecord | null>
  getLatestRunByProjectId(projectId: string): Promise<WorkflowRunWithSteps>
  getTimelineByProjectId(projectId: string): Promise<WorkflowRunWithSteps>
}

