import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityToggleButton, type ActivityToggleButtonProps } from './ActivityToggleButton'

export type OpenToWorkButtonProps = Omit<
  ActivityToggleButtonProps,
  'checkedLabel' | 'uncheckedLabel' | 'checkedHint' | 'uncheckedHint'
>

export const OpenToWorkButton = memo(function OpenToWorkButton(props: OpenToWorkButtonProps) {
  const { t } = useTranslation()

  return (
    <ActivityToggleButton
      {...props}
      checkedLabel={t('profile.openToWorkShort')}
      uncheckedLabel={t('profile.openToWorkOff')}
      checkedHint={t('profile.openToWorkCatalogHint')}
      uncheckedHint={t('profile.openToWorkHiddenHint')}
    />
  )
})
