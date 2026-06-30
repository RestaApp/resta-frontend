import { Badge } from '@/components/ui/badge'
import { FORMATTED_USER_TEXT_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import type { ContactType } from '@/services/api/analyticsApi'
import type { ProfileInfoRow, ProfileInfoSection } from '../buildProfileViewModel'
import { CollapsibleProfileSection } from './profileOverviewPrimitives'
import {
  InfoRow,
  LABEL_CLASS,
  ROW_CLASS,
  VALUE_CLASS,
  VALUE_LINK_CLASS,
} from './profile-info/InfoRow'

export type ProfileContactType = ContactType | 'price_list'

/** id строки профиля → тип контакта для аналитики. */
const CONTACT_ROW_TYPE: Record<string, ProfileContactType> = {
  phone: 'phone',
  email: 'email',
  website: 'website',
  'price-list': 'price_list',
}

const renderInfoValue = (
  row: ProfileInfoRow,
  onContactClick?: (type: ProfileContactType) => void
) => {
  if (row.value.kind === 'tags') {
    return (
      <div className={cn(ROW_CLASS, 'items-start')}>
        <span className={cn(LABEL_CLASS, 'min-w-0 sm:min-w-32')}>{row.label}</span>
        <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2">
          {row.value.values.map(item => (
            <Badge key={item.id} variant="tag">
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  const contactType = row.value.href ? CONTACT_ROW_TYPE[row.id] : undefined

  return (
    <InfoRow
      label={row.label}
      href={row.value.href}
      onClick={contactType && onContactClick ? () => onContactClick(contactType) : undefined}
      valueClassName={cn(
        row.value.href ? VALUE_LINK_CLASS : VALUE_CLASS,
        row.value.multiline ? FORMATTED_USER_TEXT_CLASS : 'truncate'
      )}
    >
      {row.value.value}
    </InfoRow>
  )
}

export const ProfileInfoSectionView = ({
  section,
  variant,
  onContactClick,
}: {
  section: ProfileInfoSection
  variant: 'page' | 'drawer'
  onContactClick?: (type: ProfileContactType) => void
}) => {
  if (section.rows.length === 0) return null

  return (
    <CollapsibleProfileSection title={section.title} variant={variant}>
      <div className="divide-y divide-border/50 text-sm">
        {section.rows.map(row => renderInfoValue(row, onContactClick))}
      </div>
    </CollapsibleProfileSection>
  )
}
