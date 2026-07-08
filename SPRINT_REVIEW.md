# Sprint Review - Sprint 05

## Sprint Number
05

## Sprint Goal
Integrate GPT Image to generate 3 logos from 3 approved prompts, using a provider-based image generation service and storing logo + asset records in the database.

## Completed Features
- Added `ImageGenerationService` as a dedicated image generation layer.
- Added `ImageProvider` contract and `OpenAIImageProvider` implementation.
- Extended the workflow with `logo_generate` and `logo_store` steps.
- Stored logo metadata in new `Logo` and `LogoAsset` tables.
- Linked logos to `Project`, `Prompt`, `PromptVersion`, and `WorkflowRun`.
- Added a logo pipeline view on the project detail page.
- Added optional image model configuration via `OPENAI_IMAGE_MODEL`.
- Added a Prisma migration for logo storage.
- Rendered logo previews in the UI from `asset.dataUrl` or `asset.sourceUrl`.
- Added provider-side validation so empty image results fail fast.
- Sanitized `generationOutputJson` before persisting to the database.
- Separated runtime logo drafts from persisted workflow state using `runtimeGeneratedLogoDrafts`.

## Folder Structure
- `src/modules/images/`
- `src/modules/logos/`
- `src/modules/workflow/`
- `src/components/app/`
- `prisma/migrations/`

## Files Added
- `src/modules/images/domain/image-provider.ts`
- `src/modules/images/application/image-generation.service.ts`
- `src/modules/images/infrastructure/openai-image.provider.ts`
- `src/modules/logos/domain/logo.ts`
- `src/modules/logos/application/logo.repository.ts`
- `src/modules/logos/application/logo.use-cases.ts`
- `src/modules/logos/infrastructure/prisma-logo.repository.ts`
- `src/components/app/logo-pipeline-card.tsx`
- `prisma/migrations/20260708000200_sprint_05_logo_generation/migration.sql`

## Files Modified
- `prisma/schema.prisma`
- `src/lib/env.ts`
- `src/modules/workflow/domain/workflow.ts`
- `src/modules/workflow/application/workflow.use-cases.ts`
- `src/modules/workflow/presentation/workflow.actions.ts`
- `src/modules/brand-form/presentation/brand-form.actions.ts`
- `src/components/app/workflow-timeline.tsx`
- `src/app/(dashboard)/projects/[projectId]/page.tsx`
- `src/modules/images/domain/image-provider.ts`
- `src/modules/images/application/image-generation.service.ts`
- `src/modules/images/infrastructure/openai-image.provider.ts`
- `src/modules/logos/infrastructure/prisma-logo.repository.ts`
- `src/components/app/logo-pipeline-card.tsx`

## Database Changes
- Added `Logo` table.
- Added `LogoAsset` table.
- Added indexes for project, workflow run, prompt, status, and asset lookup.
- Added foreign keys from `Logo` to `Project`, `WorkflowRun`, `Prompt`, and `PromptVersion`.
- Added foreign key from `LogoAsset` to `Logo`.

## API Changes
- No public API routes were added.
- Internal workflow/action interfaces were extended to pass image generation and logo storage dependencies.

## New UI Screens
- Project detail page now shows a `Logo Pipeline` card.

## AI Workflow Changes
- Added `logo_generate` step after prompt storage.
- Added `logo_store` step to persist logo and asset records.
- Workflow now uses a provider-based image generation service instead of calling OpenAI directly from workflow code.

## Test Results
- `npx prisma generate` OK
- `npm run build` OK
- `npm run lint` OK

## Known Issues
- OpenAI image generation still depends on a valid `OPENAI_API_KEY` and a working OpenAI image model at runtime.

## Next Sprint Suggestion
- Vision Review for generated logos.
- Compare Engine for choosing the best logo set.
- Variation flow for refining selected logos.
