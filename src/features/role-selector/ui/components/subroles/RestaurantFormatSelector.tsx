import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingState } from './shared/LoadingState'
import { RoleDetailsStep } from './shared/RoleDetailsStep'
import { useLabels } from '@/shared/i18n/hooks'
import type { RestaurantOnboardingData } from '../../../model/useSubRoleSubmission'

interface RestaurantFormatSelectorProps {
  onContinue: (formData: RestaurantOnboardingData) => Promise<boolean> | void
  onBack: () => void
  restaurantFormats?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

export const RestaurantFormatSelector = memo(function RestaurantFormatSelector({
  onContinue,
  onBack,
  restaurantFormats,
  isLoading = false,
  isFetching = false,
}: RestaurantFormatSelectorProps) {
  const { t } = useTranslation()
  const { getRestaurantFormatLabel } = useLabels()
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  const handleContinue = useCallback(() => {
    if (!selectedFormat) return
    void onContinue({ format: selectedFormat })
  }, [selectedFormat, onContinue])

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!isLoading && !isFetching && (!restaurantFormats || restaurantFormats.length === 0)) {
    return <LoadingState message={t('roles.restaurantFormatsError')} />
  }

  return (
    <RoleDetailsStep
      stepNameKey="onboarding.stepNames.venue"
      title={t('roles.venueInfoTitle')}
      subtitle={t('roles.venueInfoDescription')}
      groups={[
        {
          id: 'format',
          label: t('roles.venueTypeLabel'),
          values: restaurantFormats || [],
          selectedValues: selectedFormat ? [selectedFormat] : [],
          onToggle: setSelectedFormat,
          getLabel: getRestaurantFormatLabel,
          getAriaLabel: (_, label) => t('aria.selectType', { label }),
        },
      ]}
      ctaText={t('common.continue')}
      onContinue={handleContinue}
      onBack={onBack}
      canContinue={selectedFormat !== null}
      continueButtonAriaLabel={t('common.continue')}
    />
  )
})
