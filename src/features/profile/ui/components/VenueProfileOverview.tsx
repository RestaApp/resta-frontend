import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, ChevronDown, Plus, UserRound } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { navigateToTab } from '@/store/slices/navigationSlice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KpiRow, type KpiItem } from '@/components/ui/kpi-row'
import { FORMATTED_USER_TEXT_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import type {
  ProfileInfoRow,
  ProfileViewModel,
} from '@/shared/ui/user-profile/buildProfileViewModel'
import {
  InfoRow,
  VALUE_CLASS,
  VALUE_LINK_CLASS,
} from '@/shared/ui/user-profile/components/profile-info/InfoRow'
import { VenueProfileHero } from './VenueProfileHero'

interface VenueProfileOverviewProps {
  profile: ProfileViewModel
  infoRows: ProfileInfoRow[]
  openShiftsCount: number
  hiresCount: number
  onFill?: () => void
}

const BIO_PREVIEW_LINES = 3

const renderInfoValue = (row: ProfileInfoRow) => {
  if (row.value.kind === 'tags') return null

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

const VenueAboutSection = ({ bio }: { bio: string }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldCollapse = bio.length > 120 || bio.split('\n').length > BIO_PREVIEW_LINES

  return (
    <div className="flex flex-col gap-2">
      <h4 className={SHIFT_CARD_TITLE_CLASS}>{t('profile.venue.aboutUs')}</h4>
      <p
        className={cn(
          'text-sm leading-relaxed text-muted-foreground',
          !isExpanded && shouldCollapse && 'line-clamp-3'
        )}
      >
        {bio}
      </p>
      {shouldCollapse ? (
        <button
          type="button"
          onClick={() => setIsExpanded(value => !value)}
          data-haptic="selection"
          className="inline-flex w-fit text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          {isExpanded ? t('common.showLess') : t('profile.venue.readMore')}
        </button>
      ) : null}
    </div>
  )
}

export const VenueProfileOverview = memo(function VenueProfileOverview({
  profile,
  infoRows,
  openShiftsCount,
  hiresCount,
  onFill,
}: VenueProfileOverviewProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const showFillAction = !profile.isProfileFilled && Boolean(onFill)
  const bio = profile.userProfile.bio?.trim() ?? ''
  const rating = profile.reviewSummary?.rating ?? '—'
  const ratingNum = Number(profile.userProfile.average_rating)
  const hasRating = Number.isFinite(ratingNum) && ratingNum > 0

  const kpiItems = useMemo<KpiItem[]>(
    () => [
      {
        id: 'open-shifts',
        value: openShiftsCount,
        label: t('profile.venue.kpi.openShifts'),
      },
      {
        id: 'rating',
        value: rating,
        label: t('profile.kpi.rating'),
        tone: hasRating ? 'success' : 'muted',
      },
      {
        id: 'hires',
        value: hiresCount,
        label: t('profile.venue.kpi.hires'),
      },
    ],
    [hasRating, hiresCount, openShiftsCount, rating, t]
  )

  const handleCreateVacancy = useCallback(() => {
    emitAppEvent(APP_EVENTS.SET_VENUE_CREATE_TYPE, { type: 'vacancy' })
    emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
  }, [])

  const handleCreateReplacement = useCallback(() => {
    emitAppEvent(APP_EVENTS.SET_VENUE_CREATE_TYPE, { type: 'replacement' })
    emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
  }, [])

  const handleViewApplications = useCallback(() => {
    dispatch(navigateToTab('staff'))
  }, [dispatch])

  const actionButtons = useMemo(
    () => (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="gradient"
          size="md"
          className="w-full"
          onClick={handleCreateVacancy}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('profile.venue.createVacancy')}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleCreateReplacement}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('profile.venue.urgentReplacement')}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleViewApplications}
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {t('profile.venue.viewApplications')}
        </Button>
      </div>
    ),
    [handleCreateReplacement, handleCreateVacancy, handleViewApplications, t]
  )

  return (
    <div className="flex flex-col gap-3">
      <VenueProfileHero
        userProfile={profile.userProfile}
        userName={profile.userName}
        roleLabel={profile.roleLabel}
        isHiringOpen={openShiftsCount > 0}
        hiringOpenLabel={t('profile.venue.hiringOpen')}
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

      <KpiRow
        items={kpiItems}
        className="gap-2"
        itemClassName="rounded-lg border-border bg-card px-3 py-3"
      />

      {actionButtons}

      {infoRows.length > 0 ? (
        <Card className={SHIFT_CARD_CLASS}>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsInfoOpen(value => !value)}
              data-haptic="light"
              className="flex w-full items-center gap-2 rounded-sm transition-colors hover:text-primary"
              aria-expanded={isInfoOpen}
            >
              <h4 className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 flex-1 truncate text-left')}>
                {t('common.aboutVenue')}
              </h4>
              <motion.span
                animate={{ rotate: isInfoOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto rounded-sm bg-secondary/60 p-1"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.span>
            </button>

            {isInfoOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border/50 text-sm">
                  {infoRows.map(row => (
                    <div key={row.id}>{renderInfoValue(row)}</div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {bio ? <VenueAboutSection bio={bio} /> : null}
    </div>
  )
})
