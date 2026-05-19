import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Briefcase, ChevronDown, ArrowRight } from 'lucide-react'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiRole } from '@/types'
import type { UserData } from '@/services/api/authApi'
import { formatPhoneDisplay, toE164 } from '@/utils/phone'
import { getProfileCompleteness } from '../../model/utils/profileCompleteness'
import { businessHoursRecordToFormValue } from '../../model/utils/businessHoursForm'
import { normalizeExternalUrl } from '@/utils/externalUrl'
import { useLabels, useProfileFormLabels } from '@/shared/i18n/hooks'
import {
  InfoRow,
  LABEL_CLASS,
  ROW_CLASS,
  VALUE_CLASS,
  VALUE_LINK_CLASS,
} from './profile-info/InfoRow'
import { ProfileInfoEmployeeSection } from './profile-info/ProfileInfoEmployeeSection'

type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

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
      (isBusinessRole && userProfile.website?.trim()) ||
      venueHoursDisplay ||
      (isSupplierRole && supplierTypes.length > 0)
    )

    const fillActionButton = onFill ? (
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={onFill} variant="gradient" size="md" className="min-w-39" type="button">
          {t('common.fill')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    ) : null

    const incompleteCallout = !isFilled ? (
      <div className="flex flex-col gap-4 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-5 text-center">
        <p className="text-sm leading-relaxed text-foreground/80">{fillRequiredText}</p>
        {fillActionButton ? <div className="flex justify-center">{fillActionButton}</div> : null}
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
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className="w-full -mx-2 -my-1 flex items-center gap-2 rounded-xl transition-colors hover:bg-secondary/35"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Briefcase className="size-4.5 text-primary" />
          </span>

          <h4
            className={cn(BLOCK_TITLE_CLASS, 'min-w-0 flex-1 truncate text-left whitespace-nowrap')}
          >
            {infoSectionTitle}
          </h4>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-md bg-secondary/60 p-1"
            >
              <ChevronDown className="size-4.5 text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm"
          >
            {!isFilled && !isSupplierRole ? (
              <div className="py-3">{incompleteCallout}</div>
            ) : (
              <>
                {!isFilled && isSupplierRole ? <div>{incompleteCallout}</div> : null}
                {userProfile.bio && (
                  <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                  {isBusinessRole && userProfile.website?.trim() && (
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
                      <span className={cn(LABEL_CLASS, 'min-w-0 sm:min-w-32')}>
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
                    <div className="flex flex-col gap-1 py-2.5">
                      <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
      </div>
    )
    return variant === 'section' ? (
      <div className="py-2">{content}</div>
    ) : (
      <Card className="p-4  shadow-black/5">{content}</Card>
    )
  }
)
ProfileInfoCard.displayName = 'ProfileInfoCard'
