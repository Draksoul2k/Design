import Link from 'next/link'
import { Pencil, PlusCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/app/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getCurrentUser } from '@/modules/auth/application/auth.service'
import { listProjects } from '@/modules/projects/application/project.use-cases'
import { projectRepository } from '@/modules/projects/infrastructure/prisma-project.repository'
import { deleteProjectAction } from '@/modules/projects/presentation/project.actions'
import { DeleteProjectButton } from '@/modules/projects/presentation/delete-project-button'

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const projects = await listProjects(projectRepository, user.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Danh sách project của bạn.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project list</CardTitle>
          <CardDescription>
            Sửa tên, xem danh sách và xoá project khi cần.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên project</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      {project.createdAt.toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}/brand-form`}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Brand Form
                          </Link>
                        </Button>
                        <form action={deleteProjectAction}>
                          <input type="hidden" name="projectId" value={project.id} />
                          <DeleteProjectButton projectName={project.name} />
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Chưa có project nào"
              description="Tạo project đầu tiên để bắt đầu quản lý branding."
              ctaLabel="Tạo Project"
              ctaHref="/projects/new"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
