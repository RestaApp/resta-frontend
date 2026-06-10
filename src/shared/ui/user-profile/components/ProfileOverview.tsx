import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, BriefcaseBusiness, ChevronDown, Plus, Star } from 'lucide-react'
import { OpenToWorkButton } from '@/shared/ui/OpenToWorkButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
} from '../buildProfileViewModel'
import { ProfileHero } from './ProfileHero'
import {
  InfoRow,
  LABEL_CLASS,
  ROW_CLASS,
  VALUE_CLASS,
  VALUE_LINK_CLASS,
} from './profile-info/InfoRow'

interface ProfileOverviewProps {
  profile: ProfileViewModel
  variant?: 'page' | 'drawer'
  onFill?: () => void
  onEditSpecializations?: () => void
  onEditSupplierTypes?: () => void
  onOpenToWorkToggle?: (nextValue: boolean) => void
  isOpenToWorkUpdating?: boolean
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className={PROFILE_SECTION_LABEL_CLASS}>{children}</div>
)

const renderInfoValue = (row: ProfileInfoRow) => {
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

  return (
    <InfoRow
      label={row.label}
      href={row.value.href}
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
    <button
      type="button"
      onClick={onEdit}
      data-haptic="selection"
      className="inline-flex min-h-7 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
      aria-label={editAriaLabel}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      {t('common.add')}
    </button>
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
    </div>
  )
}

const ProfileInfoSectionView = ({
  section,
  variant,
}: {
  section: ProfileInfoSection
  variant: 'page' | 'drawer'
}) => {
  const [isOpen, setIsOpen] = useState(variant === 'drawer')

  if (section.rows.length === 0) return null

  const content = (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        data-haptic="light"
        className="flex w-full items-center gap-2 rounded-sm transition-colors hover:text-primary"
        aria-expanded={isOpen}
      >
        <h4 className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 flex-1 truncate text-left')}>
          {section.title}
        </h4>
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
          <div className="divide-y divide-border/50 text-sm">
            {section.rows.map(row => renderInfoValue(row))}
          </div>
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

export const ProfileOverview = memo(function ProfileOverview({
  profile,
  variant = 'page',
  onFill,
  onEditSpecializations,
  onEditSupplierTypes,
  onOpenToWorkToggle,
  isOpenToWorkUpdating = false,
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

      <ProfileReviewSummary profile={profile} />

      {profile.infoSections.map(section => (
        <ProfileInfoSectionView key={section.id} section={section} variant={variant} />
      ))}
    </div>
  )
})
