'use client'

import { useActionState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProjectActionState } from '@/modules/projects/presentation/project.actions'
import {
  createProjectAction,
  renameProjectAction
} from '@/modules/projects/presentation/project.actions'

const initialState: ProjectActionState = {
  status: 'idle',
  message: ''
}

type ProjectFormProps = {
  mode: 'create' | 'edit'
  defaultName?: string
  projectId?: string
}

export function ProjectForm({ mode, defaultName = '', projectId }: ProjectFormProps) {
  const action = mode === 'create' ? createProjectAction : renameProjectAction
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Tạo Project mới' : 'Chỉnh sửa Project'}</CardTitle>
        <CardDescription>
          Đặt tên project rõ ràng để quản lý lịch sử thiết kế dễ hơn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
          <div className="space-y-2">
            <Label htmlFor="name">Tên Project</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultName}
              placeholder="Ví dụ: Nova Studio Branding"
              maxLength={80}
              required
            />
            <p className="text-xs text-muted-foreground">
              2-80 ký tự. Nên phản ánh tên thương hiệu hoặc mục tiêu dự án.
            </p>
          </div>

          {state.message ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : null}

          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {mode === 'create' ? 'Tạo Project' : 'Lưu thay đổi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

