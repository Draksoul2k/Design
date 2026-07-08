import Link from 'next/link'
import { FolderOpen, PlusCircle, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/app/empty-state'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'
import { listProjects } from '@/modules/projects/application/project.use-cases'
import { getCurrentUser } from '@/modules/auth/application/auth.service'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const projects = await listProjects(projectRepository, user.id)

  const totalProjects = projects.length
  const recentProjects = projects.slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý project branding và chuẩn bị cho workflow AI.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo Project
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng project</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Trạng thái Sprint 1</CardDescription>
            <CardTitle className="text-lg">Auth + CRUD ready</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Next step</CardDescription>
            <CardTitle className="text-lg">Brand Form & Workflow</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Project gần đây</CardTitle>
            <CardDescription>
              Các project branding đang được quản lý trong workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cập nhật {project.updatedAt.toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/projects/${project.id}/edit`}>Chỉnh sửa</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có project nào"
                description="Tạo project đầu tiên để bắt đầu lưu lịch sử branding."
                ctaLabel="Tạo Project"
                ctaHref="/projects/new"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Luồng làm việc</CardTitle>
            <CardDescription>
              Sprint 1 chỉ mở nền tảng quản lý project. AI workflow sẽ đến sau.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <WandSparkles className="mt-0.5 h-4 w-4 text-primary" />
              Authentication đã sẵn sàng.
            </div>
            <div className="flex items-start gap-3">
              <FolderOpen className="mt-0.5 h-4 w-4 text-primary" />
              Project CRUD đã sẵn sàng.
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4">
              Tiếp theo: Brand Form, Workflow Engine và AI orchestration.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

