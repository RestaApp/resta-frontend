import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, Plus, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InlineAction } from '@/components/ui/inline-action'
import { Card } from '@/components/ui/card'
import { FORMATTED_USER_TEXT_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import type {
  ProfileTagSection,
  ProfileViewModel,
  ProfileWorkHistoryItem,
} from '../buildProfileViewModel'
import { ProfileReviewsList } from './ProfileReviewsList'
import { CollapsibleProfileSection, SectionLabel } from './profileOverviewPrimitives'

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

export const ProfileTagSectionView = ({
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

export const ProfileWorkHistoryView = ({
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

export const ProfileReviewSummary = ({ profile }: { profile: ProfileViewModel }) => {
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
