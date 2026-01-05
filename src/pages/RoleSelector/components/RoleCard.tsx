/**
 * Компонент карточки роли
 * Использует универсальный компонент CardSelect
 */

import { memo, useCallback } from 'react'
import { CardSelect } from '@/components/ui/card-select'
import type { UiRole, RoleOption } from '@/types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UiRole) => void
}

export const RoleCard = memo(function RoleCard({
  role,
  isSelected,
  index,
  onSelect,
}: RoleCardProps) {
  const Icon = role.icon

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id as UiRole)
    },
    [onSelect]
  )

  return (
    <CardSelect
      id={role.id}
      title={role.title}
      description={role.description}
      image={<Icon className="w-6 h-6 text-white" aria-hidden="true" />}
      imageType="icon"
      isSelected={isSelected}
      index={index}
      layout="horizontal"
      onSelect={handleSelect}
      ariaLabel={`Выбрать роль: ${role.title}`}
    />
  )
})
