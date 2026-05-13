import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LocationField } from './subroles/shared/LocationField'
import { Card } from '@/components/ui'
import { OnboardingProgress } from './OnboardingProgress'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useTelegramConfirmStep } from '../../model/useTelegramConfirmStep'
import { formatPhoneInput } from '@/utils/phone'
import type { UiRole } from '@/shared/types/roles.types'
import { getRoleKind, getRoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE } from './OnboardingBottomCta'

const ROLE_AVATAR_GRADIENT: Record<ReturnType<typeof getRoleKind>, string> = {
  employee: 'bg-[image:var(--gradient-emp)]',
  restaurant: 'bg-[image:var(--gradient-primary)]',
  supplier: 'bg-[image:var(--gradient-primary)]',
}

const ROLE_SHIELD_ICON: Record<ReturnType<typeof getRoleKind>, string> = {
  employee: '🛡',
  restaurant: '⚡',
  supplier: '⭐',
}

interface TelegramConfirmStepProps {
  onContinue: () => void
  onBack: () => void
  selectedRole: UiRole | null
}

export const TelegramConfirmStep = memo(function TelegramConfirmStep({
  onContinue,
  onBack,
  selectedRole,
}: TelegramConfirmStepProps) {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)
  const copyRole =
    selectedRole === 'venue' || selectedRole === 'supplier' ? selectedRole : 'employee'
  const roleKind = getRoleKind(selectedRole ?? 'chef')
  const roleTheme = getRoleTheme(selectedRole ?? 'chef')
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [needsScroll, setNeedsScroll] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const {
    displayName,
    editedName,
    setEditedName,
    displayUsername,
    manualPhone,
    selectedCity,
    phoneError,
    cityError,
    isPhoneFilled,
    isRequestingPhone,
    isRequestingLocation,
    isSaving,
    handlePhoneShare,
    handleLocationShare,
    handleContinue,
    setManualPhone,
    setSelectedCity,
    setPhoneError,
    setCityError,
  } = useTelegramConfirmStep({ onContinue, onBack })

  useEffect(() => {
    const container = scrollContainerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const updateScrollState = () => {
      setNeedsScroll(content.scrollHeight > container.clientHeight + 1)
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(container)
    resizeObserver.observe(content)
    window.addEventListener('resize', updateScrollState)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  return (
    <div className="bg-background min-h-[100dvh] flex flex-col">
      <div
        ref={scrollContainerRef}
        className={`flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] ${ONBOARDING_BOTTOM_CTA_SPACE} ${
          needsScroll ? 'overflow-y-auto' : 'overflow-y-hidden'
        }`}
      >
        <div ref={contentRef}>
          <OnboardingProgress current={2} total={3} tone={roleKind} className="mb-[14px]" />
          <div className="mb-4">
            <h1 className="font-sans font-extrabold text-[22px] leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
              {t('onboarding.telegram.title')}
            </h1>
            <p className="text-meta leading-snug text-muted-foreground">
              {t(`onboarding.telegram.copy.${copyRole}.subtitle`)}
            </p>
          </div>

          <Card className="text-center">
            <div
              className={cn(
                'mx-auto mb-3 h-14 w-14 overflow-hidden rounded-[16px]',
                ROLE_AVATAR_GRADIENT[roleKind]
              )}
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            {isEditingName ? (
              <Input
                autoFocus
                value={editedName || displayName}
                onChange={e => setEditedName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') setIsEditingName(false)
                }}
                className="mx-auto h-8 max-w-[220px] text-center text-sm font-semibold"
                aria-label={t('onboarding.telegram.editName', { defaultValue: 'Имя' })}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="mx-auto inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
                aria-label={t('onboarding.telegram.editName', { defaultValue: 'Имя' })}
              >
                {displayName}
                <Pencil className="h-3 w-3 text-muted-foreground" aria-hidden />
              </button>
            )}
            <div className="mt-0.5 text-meta text-muted-foreground">{displayUsername}</div>
            <div className="mt-2.5 font-mono-resta text-meta uppercase tracking-[0.08em] text-success">
              {t('onboarding.telegram.connected')}
            </div>
          </Card>

          <div className="mt-3">
            <div className="mb-2 font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
              {t('onboarding.telegram.phoneRequiredLabel')}
            </div>
            <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-input-background px-3 text-sm">
              <Input
                variant="inline"
                value={manualPhone}
                onChange={e => {
                  setManualPhone(formatPhoneInput(e.target.value))
                  setPhoneError(null)
                }}
                placeholder={t('phone.placeholderExample')}
              />
              <button
                type="button"
                onClick={handlePhoneShare}
                className={cn(
                  'whitespace-nowrap font-mono-resta text-[10px] uppercase leading-none tracking-[0.05em] disabled:opacity-60',
                  roleTheme.classes.text
                )}
                disabled={isRequestingPhone}
              >
                {isPhoneFilled ? t('onboarding.telegram.shared') : t('onboarding.telegram.share')}
              </button>
            </div>
            {phoneError ? <p className="mt-1 text-xs text-destructive">{phoneError}</p> : null}
          </div>

          <div className="mt-3">
            <div className="mb-2 font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
              {t('onboarding.telegram.cityLabel')}
            </div>
            <div className="w-full">
              <LocationField
                value={selectedCity}
                onChange={value => {
                  setSelectedCity(value)
                  setCityError(null)
                }}
                onLocationRequest={handleLocationShare}
                isLoading={isRequestingLocation}
                hideLabel
              />
            </div>
            {cityError ? <p className="mt-1 text-xs text-destructive">{cityError}</p> : null}
          </div>

          <div
            role="note"
            className={cn(
              'mt-3.5 rounded-xl border px-3 py-2.5',
              roleTheme.classes.border,
              roleTheme.classes.bgSurface
            )}
          >
            <div className="flex items-start gap-2">
              <span aria-hidden className={cn('shrink-0 mt-0.5 text-sm', roleTheme.classes.text)}>
                {ROLE_SHIELD_ICON[roleKind]}
              </span>
              <div className="flex-1 text-meta leading-snug text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {t(`onboarding.telegram.copy.${copyRole}.shieldTitle`)}
                </span>{' '}
                {t(`onboarding.telegram.copy.${copyRole}.shieldText`)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingBottomCta
        onClick={handleContinue}
        loading={isSaving}
        disabled={isSaving}
        tone={roleKind}
      >
        {t('onboarding.telegram.next')}
      </OnboardingBottomCta>
    </div>
  )
})
