import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Plus,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { OpenToWorkButton } from '@/shared/ui/OpenToWorkButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineAction } from '@/components/ui/inline-action'
import { Card } from '@/components/ui/card'
import { KpiRow } from '@/components/ui/kpi-row'
import { FORMATTED_USER_TEXT_CLASS, PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import type {
  ProfileInfoRow,
  ProfileInfoSection,
  ProfileTagSection,
  ProfileViewModel,
  ProfileWorkHistoryItem,
} from '../buildProfileViewModel'
import type { ContactType } from '@/services/api/analyticsApi'
import { ProfileHero } from './ProfileHero'
import { ProfileReviewsList } from './ProfileReviewsList'
import {
  InfoRow,
  LABEL_CLASS,
  ROW_CLASS,
  VALUE_CLASS,
  VALUE_LINK_CLASS,
} from './profile-info/InfoRow'

export type ProfileContactType = ContactType | 'price_list'

interface ProfileOverviewProps {
  profile: ProfileViewModel
  variant?: 'page' | 'drawer'
  onFill?: () => void
  onEditSpecializations?: () => void
  onEditSupplierTypes?: () => void
  onOpenToWorkToggle?: (nextValue: boolean) => void
  isOpenToWorkUpdating?: boolean
  /** Трек клика по контакту/прайсу (только для чужих профилей). */
  onContactClick?: (type: ProfileContactType) => void
}

/** id строки профиля → тип контакта для аналитики. */
const CONTACT_ROW_TYPE: Record<string, ProfileContactType> = {
  phone: 'phone',
  email: 'email',
  website: 'website',
  'price-list': 'price_list',
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className={PROFILE_SECTION_LABEL_CLASS}>{children}</div>
)

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

const ProfileTagBadge = ({ item }: { item: ProfileTagSection['items'][number] }) => (
  <Badge
    variant="tag"
    className={cn(item.id === 'experience' && 'border-primary/30 bg-primary/10 text-primary')}
  >
    {item.id === 'experience' ? (
      <BriefcaseBusiness className="h-3 w-3 text-primary" aria-hidden="true" />
    ) : null}
    {item.label}
  </Badge>
)

const ProfileTagSectionView = ({
  section,
  onEdit,
  editAriaLabel,
}: {
  section: ProfileTagSection
  onEdit?: () => void
  editAriaLabel?: string
}) => {
  const { t } = useTranslation()
  const hasItems = section.items.length > 0
  if (!hasItems && !onEdit) return null

  const specializationItems = section.items.filter(item => item.id !== 'experience')
  const experienceItem = section.items.find(item => item.id === 'experience')

  const addButton = onEdit ? (
    <InlineAction icon={Plus} onClick={onEdit} data-haptic="selection" aria-label={editAriaLabel}>
      {t('common.add')}
    </InlineAction>
  ) : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>{section.title}</SectionLabel>
        {addButton}
      </div>
      {hasItems ? (
        <div className="flex flex-wrap items-center gap-2">
          {specializationItems.map(item => (
            <ProfileTagBadge key={item.id} item={item} />
          ))}
          {experienceItem ? <ProfileTagBadge item={experienceItem} /> : null}
        </div>
      ) : null}
    </div>
  )
}

const ProfileOpenToWorkCard = ({
  visible,
  checked,
  disabled,
  onToggle,
}: {
  visible: boolean
  checked: boolean
  disabled?: boolean
  onToggle?: (nextValue: boolean) => void
}) => {
  if (!visible || !onToggle) return null

  return <OpenToWorkButton checked={checked} disabled={disabled} onToggle={onToggle} />
}

const ProfileReviewSummary = ({ profile }: { profile: ProfileViewModel }) => {
  const { t } = useTranslation()
  if (!profile.reviewSummary) return null

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{t('profile.latestReviews')}</SectionLabel>
      <Card className={SHIFT_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-elevated text-foreground')}>R</div>
            <div className="min-w-0">
              <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                {t('profile.reviewSummaryTitle')}
              </div>
              <div className={SHIFT_CARD_SUB_CLASS}>
                {profile.reviewSummary.reviews} {t('common.reviews5')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1" aria-label={t('common.rating')}>
            {[0, 1, 2, 3, 4].map(index => {
              const ratingNum = Number(profile.reviewSummary!.rating)
              const filled = Number.isFinite(ratingNum) && index < Math.round(ratingNum)
              return (
                <Star
                  key={index}
                  className={cn(
                    'h-3.5 w-3.5',
                    filled ? 'fill-current text-warning' : 'text-muted-foreground/30'
                  )}
                />
              )
            })}
          </div>
        </div>
      </Card>
      <ProfileReviewsList userId={profile.userProfile.id} />
    </div>
  )
}

const WorkHistoryEntryView = ({ item }: { item: ProfileWorkHistoryItem }) => {
  const { t } = useTranslation()

  return (
    <div className="relative flex flex-col gap-0.5 pl-4">
      <span
        className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary/70 ring-2 ring-primary/15"
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0')}>
          {item.position || item.company}
        </span>
        {item.isCurrent ? (
          <Badge variant="tag" className="border-primary/30 bg-primary/10 text-primary">
            {t('profile.workHistory.currentBadge')}
          </Badge>
        ) : null}
      </div>
      {item.position && item.company ? (
        <span className="text-sm text-foreground/80">{item.company}</span>
      ) : null}
      <span className={SHIFT_CARD_SUB_CLASS}>
        {[item.period, item.city].filter(Boolean).join(' · ')}
      </span>
      {item.description ? (
        <p className={cn(FORMATTED_USER_TEXT_CLASS, 'mt-1 text-sm text-foreground/70')}>
          {item.description}
        </p>
      ) : null}
    </div>
  )
}

/** Сворачиваемая секция профиля (общий каркас для info- и work-history-секций). */
const CollapsibleProfileSection = ({
  title,
  icon: Icon,
  variant,
  children,
}: {
  title: string
  icon?: LucideIcon
  variant: 'page' | 'drawer'
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(variant === 'drawer')

  const content = (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        data-haptic="light"
        className="flex w-full items-center gap-2 rounded-sm transition-colors hover:text-primary"
        aria-expanded={isOpen}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
        <h4 className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 flex-1 truncate text-left')}>{title}</h4>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto rounded-sm bg-secondary/60 p-1"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      {isOpen ? (
        <motion.div
          initial={variant === 'drawer' ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  )

  return variant === 'drawer' ? (
    <div className="py-2">{content}</div>
  ) : (
    <Card className={SHIFT_CARD_CLASS}>{content}</Card>
  )
}

const ProfileWorkHistoryView = ({
  items,
  variant,
}: {
  items: ProfileWorkHistoryItem[]
  variant: 'page' | 'drawer'
}) => {
  const { t } = useTranslation()

  if (items.length === 0) return null

  return (
    <CollapsibleProfileSection
      title={t('profile.workHistory.sectionTitle')}
      icon={BriefcaseBusiness}
      variant={variant}
    >
      <div className="flex flex-col gap-4 border-l border-border/50 pl-1">
        {items.map(item => (
          <WorkHistoryEntryView key={item.id} item={item} />
        ))}
      </div>
    </CollapsibleProfileSection>
  )
}

const ProfileInfoSectionView = ({
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

export const ProfileOverview = memo(function ProfileOverview({
  profile,
  variant = 'page',
  onFill,
  onEditSpecializations,
  onEditSupplierTypes,
  onOpenToWorkToggle,
  isOpenToWorkUpdating = false,
  onContactClick,
}: ProfileOverviewProps) {
  const { t } = useTranslation()
  const showFillAction = !profile.isProfileFilled && Boolean(onFill)
  const isEmployee = profile.apiRole === 'employee'
  const isOpenToWork = profile.userProfile.employee_profile?.open_to_work === true

  return (
    <div className={variant === 'drawer' ? 'ui-density-stack' : 'flex flex-col gap-3'}>
      <ProfileHero
        userProfile={profile.userProfile}
        userName={profile.userName}
        roleLabel={profile.roleLabel}
      />

      <ProfileOpenToWorkCard
        visible={isEmployee && Boolean(onOpenToWorkToggle)}
        checked={isOpenToWork}
        disabled={isOpenToWorkUpdating}
        onToggle={onOpenToWorkToggle}
      />

      {!profile.isProfileFilled ? (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 text-center">
          <p className="text-sm leading-relaxed text-foreground/80">{profile.fillRequiredText}</p>
          {showFillAction ? (
            <div className="flex justify-center">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onFill}
                  variant="gradient"
                  size="md"
                  className="min-w-39"
                  type="button"
                >
                  {t('common.fill')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          ) : null}
        </div>
      ) : null}

      {profile.kpis.length > 0 ? (
        <KpiRow
          items={profile.kpis}
          className="gap-2"
          itemClassName="rounded-lg border-border bg-card px-3 py-3"
        />
      ) : null}

      {profile.analyticsKpis.length > 0 ? (
        <KpiRow
          items={profile.analyticsKpis}
          className="gap-2"
          itemClassName="rounded-lg border-border bg-card px-3 py-3"
        />
      ) : null}

      {profile.tagSections.map(section => (
        <ProfileTagSectionView
          key={section.id}
          section={section}
          onEdit={
            variant === 'page' && section.id === 'employee-specializations'
              ? onEditSpecializations
              : variant === 'page' && section.id === 'supplier-types'
                ? onEditSupplierTypes
                : undefined
          }
          editAriaLabel={
            section.id === 'employee-specializations'
              ? t('aria.editSpecializations')
              : section.id === 'supplier-types'
                ? t('aria.editSupplierTypes')
                : undefined
          }
        />
      ))}

      <ProfileWorkHistoryView items={profile.workHistory} variant={variant} />

      <ProfileReviewSummary profile={profile} />

      {profile.infoSections.map(section => (
        <ProfileInfoSectionView
          key={section.id}
          section={section}
          variant={variant}
          onContactClick={onContactClick}
        />
      ))}
    </div>
  )
})
