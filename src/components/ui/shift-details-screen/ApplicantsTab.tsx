import { memo, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import type { TFunction } from 'i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { DETAIL_CARD_CLASS } from './constants'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type ApplicantPreview = NonNullable<VacancyApiItem['applications_preview']>[number]

interface ApplicantsTabProps {
  applicants: ApplicantPreview[]
  applicationsCount?: number
  moderating: { id: number; action: 'accept' | 'reject' } | null
  getEmployeePositionLabel: (value?: string | null) => string
  onSelectApplicant: (userId: number, applicationId: number | null) => void
  onAcceptApplication: (applicationId: number) => Promise<void>
  onRejectApplication: (applicationId: number) => Promise<void>
  t: TFunction
}

export const ApplicantsTab = memo(
  ({
    applicants,
    applicationsCount,
    moderating,
    getEmployeePositionLabel,
    onSelectApplicant,
    onAcceptApplication,
    onRejectApplication,
    t,
  }: ApplicantsTabProps) => {
    const [rejectApplicationId, setRejectApplicationId] = useState<number | null>(null)

    return (
      <Card padding="md" className={DETAIL_CARD_CLASS}>
        {applicants.length ? (
          <div className="flex flex-col gap-3">
            {applicants.map((app, index) => {
              const user = app.user
              const name =
                app.full_name?.trim() ||
                user?.full_name?.trim() ||
                [user?.name, user?.last_name].filter(Boolean).join(' ').trim() ||
                t('common.user')

              const rawPosition = (
                app.position ??
                user?.employee_profile?.position ??
                user?.position ??
                ''
              ).trim()
              const position = rawPosition
                ? getEmployeePositionLabel(rawPosition)
                : t('common.notSpecified')

              const rawRating = app.average_rating
              const ratingValue =
                rawRating !== undefined && rawRating !== null ? Number(rawRating) : NaN
              const hasRating = Number.isFinite(ratingValue) && ratingValue > 0
              const normalizedRating = Math.min(5, Math.max(0, ratingValue))

              const appId = app.shift_application_id ?? app.id
              const appStatus = app.shift_application_status ?? app.status ?? 'pending'
              const canReject =
                Boolean(appId) &&
                typeof appId === 'number' &&
                (appStatus === 'pending' || appStatus === 'accepted')
              const canAccept =
                Boolean(appId) && typeof appId === 'number' && appStatus === 'pending'
              const isAccepted = appStatus === 'accepted'

              const key = appId || index
              const userId = app.user_id || app.user?.id

              const handleSelect = () => {
                if (!userId) return
                onSelectApplicant(userId, appId ?? null)
              }

              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  aria-label={t('applicants.openProfileAria', { name }) || name}
                  onClick={handleSelect}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect()
                    }
                  }}
                  className={cn(
                    'rounded-lg p-3 -mx-1 transition-colors cursor-pointer',
                    'hover:bg-secondary/40 active:bg-secondary/60 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary',
                    isAccepted && 'ring-2 ring-primary/30 bg-primary/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="text-sm font-medium text-foreground break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        >
                          {name}
                        </div>
                        {isAccepted ? (
                          <Badge variant="accepted" className="shrink-0">
                            {t('shift.applicantSelected')}
                          </Badge>
                        ) : null}
                      </div>
                      <div
                        className="text-xs text-muted-foreground break-words mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1"
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      >
                        <span>
                          {t('common.position')}: {position}
                        </span>
                        {hasRating ? (
                          <span
                            className="inline-flex items-center gap-0.5"
                            aria-label={t('common.rating')}
                          >
                            {[0, 1, 2, 3, 4].map(i => (
                              <Star
                                key={i}
                                className={cn(
                                  'h3 w3 shrink-0',
                                  normalizedRating >= i + 0.5
                                    ? 'fill-warning text-warning'
                                    : 'fill-muted text-muted-foreground/30'
                                )}
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/70">—</span>
                        )}
                      </div>
                    </div>

                    {canReject || canAccept ? (
                      <div className="flex flex-row items-center gap-2 shrink-0">
                        {canReject ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-11 w-11 min-w-11 p-0 shrink-0"
                            aria-label={t('shift.rejectApplication')}
                            loading={moderating?.id === appId && moderating.action === 'reject'}
                            disabled={moderating?.id === appId}
                            onClick={e => {
                              e.stopPropagation()
                              setRejectApplicationId(appId)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {canAccept ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="h-11 w-11 min-w-11 p-0 shrink-0"
                            aria-label={t('shift.acceptApplication')}
                            loading={moderating?.id === appId && moderating.action === 'accept'}
                            disabled={moderating?.id === appId}
                            onClick={async e => {
                              e.stopPropagation()
                              await onAcceptApplication(appId)
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {index < applicants.length - 1 ? <hr className="my-2 border-border" /> : null}
                </div>
              )
            })}

            {typeof applicationsCount === 'number' && applicationsCount > applicants.length ? (
              <div className="text-xs text-muted-foreground mt-2">
                {t('shift.applicantsPreviewNote', {
                  shown: applicants.length,
                  total: applicationsCount,
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{t('shift.noApplicants')}</div>
        )}

        <ConfirmDialog
          open={rejectApplicationId !== null}
          onOpenChange={open => {
            if (!open) setRejectApplicationId(null)
          }}
          title={t('shift.rejectApplicationConfirmTitle')}
          description={t('shift.rejectApplicationConfirmDescription')}
          cancelLabel={t('common.cancel')}
          confirmLabel={t('shift.rejectApplication')}
          onConfirm={() => {
            void (async () => {
              const id = rejectApplicationId
              if (id == null) return
              setRejectApplicationId(null)
              await onRejectApplication(id)
            })()
          }}
        />
      </Card>
    )
  }
)

ApplicantsTab.displayName = 'ApplicantsTab'
