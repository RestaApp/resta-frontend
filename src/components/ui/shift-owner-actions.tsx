import React, { memo } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { IconAction } from '@/components/ui/icon-action'

export interface ShiftOwnerActionsProps {
  editLabel: string
  deleteLabel: string
  isDeleting?: boolean
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

export const ShiftOwnerActions = memo(function ShiftOwnerActions({
  editLabel,
  deleteLabel,
  isDeleting,
  onEdit,
  onDelete,
}: ShiftOwnerActionsProps) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
    >
      <IconAction title={editLabel} onClick={onEdit} disabled={isDeleting}>
        <Edit2 className="w-4 h-4" />
      </IconAction>
      <IconAction title={deleteLabel} onClick={onDelete} disabled={isDeleting}>
        <Trash2 className="w-4 h-4" />
      </IconAction>
    </div>
  )
})
