'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DeleteProjectButtonProps = {
  projectName: string
}

export function DeleteProjectButton({ projectName }: DeleteProjectButtonProps) {
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      onClick={(event) => {
        const confirmed = window.confirm(`Xoá project "${projectName}"? Hành động này không thể hoàn tác.`)
        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Xoá
    </Button>
  )
}

