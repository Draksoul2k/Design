-- CreateTable
CREATE TABLE "Logo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "promptVersionId" TEXT NOT NULL,
    "styleKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "generationInputJson" JSONB NOT NULL,
    "generationOutputJson" JSONB,
    "errorJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogoAsset" (
    "id" TEXT NOT NULL,
    "logoId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "dataUrl" TEXT,
    "sourceUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Logo_projectId_createdAt_idx" ON "Logo"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Logo_workflowRunId_createdAt_idx" ON "Logo"("workflowRunId", "createdAt");

-- CreateIndex
CREATE INDEX "Logo_promptId_createdAt_idx" ON "Logo"("promptId", "createdAt");

-- CreateIndex
CREATE INDEX "Logo_status_updatedAt_idx" ON "Logo"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "LogoAsset_logoId_createdAt_idx" ON "LogoAsset"("logoId", "createdAt");

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoAsset" ADD CONSTRAINT "LogoAsset_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Logo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
