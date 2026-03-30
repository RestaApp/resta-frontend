import { memo, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, ChevronDown, ArrowRight } from 'lucide-react'
import type { ApiRole } from '@/types'
import type { UserData, EmployeeProfile } from '@/services/api/authApi'
import { formatExperienceText } from '@/utils/experience'
import { formatPhoneDisplay, toE164 } from '@/utils/phone'
import { getProfileCompleteness } from '../../model/utils/profileCompleteness'
import { businessHoursRecordToFormValue } from '../../model/utils/businessHoursForm'
import { normalizeExternalUrl } from '@/utils/externalUrl'
import { useLabels, useProfileFormLabels } from '@/shared/i18n/hooks'

type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

const ROW_CLASS = 'flex justify-between items-baseline gap-3 py-2.5'
const LABEL_CLASS = 'text-muted-foreground shrink-0 min-w-[8rem]'
const VALUE_CLASS = 'font-medium text-foreground text-right min-w-0'
const VALUE_LINK_CLASS = 'font-medium text-primary text-right truncate hover:underline min-w-0'

interface InfoRowProps {
  label: string
  children: ReactNode
  href?: string
  valueClassName?: string
}

const InfoRow = memo(({ label, children, href, valueClassName = VALUE_CLASS }: InfoRowProps) => (
  <div className={ROW_CLASS}>
    <span className={LABEL_CLASS}>{label}</span>
    {href ? (
      <a
        href={href}
        className={cn(valueClassName, 'min-w-0 truncate')}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </a>
    ) : (
      <span
        className={cn(valueClassName, 'min-w-0 truncate')}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
    )}
  </div>
))
InfoRow.displayName = 'InfoRow'

interface ProfileInfoEmployeeSectionProps {
  employeeProfile: EmployeeProfile | null
}

const ProfileInfoEmployeeSection = memo(({ employeeProfile }: ProfileInfoEmployeeSectionProps) => {
  const { t } = useTranslation()
  if (!employeeProfile) return null
  const { experience_years, open_to_work, skills } = employeeProfile
  const hasExperience = experience_years !== undefined
  const hasOpenToWork = open_to_work !== undefined
  const skillsList = Array.isArray(skills) ? skills.map(s => s.trim()).filter(Boolean) : []
  const hasSkills = skillsList.length > 0
  if (!hasExperience && !hasOpenToWork && !hasSkills) return null

  return (
    <>
      {hasExperience && (
        <InfoRow label={t('profile.experience')}>{formatExperienceText(experience_years)}</InfoRow>
      )}
      {hasOpenToWork && (
        <InfoRow label={t('profile.openToWork')}>
          {open_to_work ? t('common.yes') : t('common.no')}
        </InfoRow>
      )}
      {hasSkills && (
        <div
          className={cn(
            ROW_CLASS,
            'flex-col items-start justify-start gap-2 sm:flex-row sm:items-start sm:justify-between'
          )}
        >
          <span className={cn(LABEL_CLASS, 'min-w-0 sm:min-w-[8rem]')}>{t('profile.skills')}</span>
          <div className="flex w-full flex-wrap justify-end gap-2 min-w-0">
            {skillsList.map(skill => (
              <Badge key={skill} variant="tag">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  )
})
ProfileInfoEmployeeSection.displayName = 'ProfileInfoEmployeeSection'

interface ProfileInfoCardProps {
  userProfile: UserData
  apiRole: ApiRole | null
  completeness: ProfileCompleteness | null
  /** Если не передан, кнопка «Заполнить» не показывается (например, в drawer просмотра кандидата) */
  onFill?: () => void
  defaultOpen?: boolean
  /** В drawer — без карточки, секция с контентом */
  variant?: 'card' | 'section'
}

export const ProfileInfoCard = memo(
  ({
    userProfile,
    apiRole,
    completeness,
    onFill,
    defaultOpen = false,
    variant = 'card',
  }: ProfileInfoCardProps) => {
    const { t } = useTranslation()
    const { getSupplierTypeLabel } = useLabels()
    const { getWorkSummaryLabel } = useProfileFormLabels()
    const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
    const isSupplierRole = apiRole === 'supplier'
    const isFilled = completeness?.isFilled ?? false
    const cityValue = userProfile.city ?? null
    const locationValue = userProfile.location ?? null
    const cityDisplay = isBusinessRole ? cityValue : (cityValue ?? locationValue)
    const workSummaryLabel = getWorkSummaryLabel(apiRole)
    const venueHoursDisplay = isBusinessRole
      ? businessHoursRecordToFormValue(userProfile.business_hours).trim()
      : ''
    const fillRequiredText =
      apiRole === 'restaurant'
        ? t('profile.fillToApplyRestaurant')
        : apiRole === 'supplier'
          ? t('profile.fillToApplySupplier')
          : t('profile.fillToApply')
    const supplierProfile = userProfile.supplier_profile ?? userProfile.supplier_profile_attributes
    const rawSupplierTypes = supplierProfile?.supplier_types
    const supplierTypes = Array.isArray(rawSupplierTypes)
      ? Array.from(new Set(rawSupplierTypes.filter(Boolean)))
      : supplierProfile?.supplier_type
        ? [supplierProfile.supplier_type]
        : []
    const infoSectionTitle =
      apiRole === 'restaurant'
        ? t('roles.venueInfoTitle')
        : apiRole === 'supplier'
          ? t('roles.supplierInfoTitle')
          : t('profile.personalInfo')
    const [isOpen, setIsOpen] = useState(defaultOpen || !isFilled)
    const hasBusinessInfoData = Boolean(
      (userProfile.bio && userProfile.bio.trim()) ||
        (cityDisplay && cityDisplay.trim()) ||
        (locationValue && locationValue.trim()) ||
        (apiRole === 'restaurant' && userProfile.website?.trim()) ||
        venueHoursDisplay ||
        (isSupplierRole && supplierTypes.length > 0)
    )

    const fillActionButton = onFill ? (
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onFill}
          variant="gradient"
          size="md"
          className="min-w-[156px]"
          type="button"
        >
          {t('common.fill')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    ) : null

    const incompleteCallout = !isFilled ? (
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-5 text-center shadow-[0_14px_28px_-24px_rgba(124,58,237,0.8)]">
        <p className="text-sm leading-relaxed text-foreground/80">{fillRequiredText}</p>
        {fillActionButton ? (
          <div className="mt-4 flex justify-center">{fillActionButton}</div>
        ) : null}
      </div>
    ) : null

    if (!isFilled || (isBusinessRole && !hasBusinessInfoData)) {
      return variant === 'section' ? (
        <div className="py-2">{incompleteCallout}</div>
      ) : (
        incompleteCallout
      )
    }

    const content = (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className="w-full -mx-2 -my-1 flex items-center gap-2 rounded-xl transition-colors hover:bg-muted/35"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Briefcase className="h-[18px] w-[18px] text-primary" />
          </span>

          <h4 className="min-w-0 flex-1 truncate text-left text-lg font-semibold leading-tight text-foreground whitespace-nowrap">
            {infoSectionTitle}
          </h4>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-md bg-muted/60 p-1"
            >
              <ChevronDown className="h-[18px] w-[18px] text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-0 text-sm overflow-hidden"
          >
            {!isFilled && !isSupplierRole ? (
              <div className="py-3">{incompleteCallout}</div>
            ) : (
              <>
                {!isFilled && isSupplierRole ? (
                  <div className="mb-4">{incompleteCallout}</div>
                ) : null}
                {userProfile.bio && (
                  <div className="pb-3 border-b border-border/50">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                      {t('common.description')}
                    </span>
                    <p className="text-foreground leading-relaxed break-words">{userProfile.bio}</p>
                  </div>
                )}
                <div className="divide-y divide-border/50">
                  {cityDisplay && (
                    <InfoRow label={t('profile.city')} valueClassName={`${VALUE_CLASS} truncate`}>
                      {cityDisplay}
                    </InfoRow>
                  )}
                  {isBusinessRole && locationValue && (
                    <InfoRow
                      label={t('profileFields.address', { defaultValue: 'Адрес' })}
                      valueClassName={`${VALUE_CLASS} whitespace-pre-line text-right`}
                    >
                      {locationValue}
                    </InfoRow>
                  )}
                  {apiRole === 'restaurant' && userProfile.website?.trim() && (
                    <InfoRow
                      label={t('profile.venueWebsite')}
                      href={normalizeExternalUrl(userProfile.website)}
                      valueClassName={VALUE_LINK_CLASS}
                    >
                      {userProfile.website.trim()}
                    </InfoRow>
                  )}
                  {isBusinessRole && venueHoursDisplay ? (
                    <InfoRow
                      label={t('profile.businessHours')}
                      valueClassName={`${VALUE_CLASS} whitespace-pre-line text-right`}
                    >
                      {venueHoursDisplay}
                    </InfoRow>
                  ) : null}
                  {isSupplierRole && supplierTypes.length > 0 ? (
                    <div className={cn(ROW_CLASS, 'items-start')}>
                      <span className={cn(LABEL_CLASS, 'min-w-0 sm:min-w-[8rem]')}>
                        {t('profile.supplierTypesLabel', { defaultValue: 'Типы поставщика' })}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2">
                        {supplierTypes.map(type => (
                          <Badge key={type} variant="tag">
                            {getSupplierTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {apiRole === 'employee' && userProfile.name && (
                    <InfoRow label={t('profile.nameLabel')}>{userProfile.name}</InfoRow>
                  )}
                  {apiRole === 'employee' && userProfile.last_name && (
                    <InfoRow label={t('profile.surname')}>{userProfile.last_name}</InfoRow>
                  )}
                  {userProfile.email && (
                    <InfoRow
                      label={t('profile.email')}
                      href={`mailto:${userProfile.email}`}
                      valueClassName={VALUE_LINK_CLASS}
                    >
                      {userProfile.email}
                    </InfoRow>
                  )}
                  {userProfile.phone && (
                    <InfoRow label={t('profile.phone')} href={`tel:${toE164(userProfile.phone)}`}>
                      {formatPhoneDisplay(userProfile.phone)}
                    </InfoRow>
                  )}
                  {userProfile.work_experience_summary && (
                    <div className="py-2.5">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                        {workSummaryLabel}
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {userProfile.work_experience_summary}
                      </p>
                    </div>
                  )}
                  {apiRole === 'employee' && (
                    <ProfileInfoEmployeeSection employeeProfile={userProfile.employee_profile} />
                  )}
                </div>
              </>
            )}
          </motion.div>
        ) : null}
      </>
    )
    return variant === 'section' ? (
      <div className="py-2">{content}</div>
    ) : (
      <Card className="p-4 shadow-sm shadow-black/5">{content}</Card>
    )
  }
)
ProfileInfoCard.displayName = 'ProfileInfoCard'
