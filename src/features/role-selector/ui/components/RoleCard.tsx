import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { CardSelect } from '@/components/ui/card-select'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UiRole) => void
}

export const RoleCard = memo(function RoleCard({ role, isSelected, index, onSelect }: RoleCardProps) {
  const { t } = useTranslation()
  const Icon = role.icon

  return (
    <CardSelect<UiRole>
      id={role.id}
      title={role.title}
      description={role.description}
      image={<Icon className="w-6 h-6 text-white" aria-hidden="true" />}
      imageType="icon"
      isSelected={isSelected}
      index={index}
      layout="horizontal"
      onSelect={onSelect}
      ariaLabel={t('aria.selectRole', { label: role.title })}
    />
  )
})
