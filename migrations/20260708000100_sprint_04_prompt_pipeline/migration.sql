-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "styleKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "latestScore" DOUBLE PRECISION,
    "latestPromptVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "promptText" TEXT NOT NULL,
    "generatedJson" JSONB,
    "reviewJson" JSONB,
    "scoreJson" JSONB,
    "score" DOUBLE PRECISION,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_projectId_styleKey_key" ON "Prompt"("projectId", "styleKey");

-- CreateIndex
CREATE INDEX "Prompt_projectId_updatedAt_idx" ON "Prompt"("projectId", "updatedAt");

-- CreateIndex
CREATE INDEX "Prompt_status_updatedAt_idx" ON "Prompt"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_promptId_version_key" ON "PromptVersion"("promptId", "version");

-- CreateIndex
CREATE INDEX "PromptVersion_workflowRunId_createdAt_idx" ON "PromptVersion"("workflowRunId", "createdAt");

-- CreateIndex
CREATE INDEX "PromptVersion_status_updatedAt_idx" ON "PromptVersion"("status", "updatedAt");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
