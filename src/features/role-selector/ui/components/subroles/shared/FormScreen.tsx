/**
 * Переиспользуемый экран формы для ресторана и поставщика
 */

import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { SectionHeader } from '@/components/ui/section-header'
import { FormField } from '@/components/ui/form-field'
import { OnboardingProgress } from '../../OnboardingProgress'
import { LocationField } from './LocationField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { setupTelegramBackButton } from '@/utils/telegram'

interface FormScreenData {
  name: string
  type: string | null
  types: string[]
  city: string
}

interface FormScreenProps {
  title: string
  description: string
  nameLabel: string
  namePlaceholder: string
  typeLabel: string
  types: string[]
  getTypeLabel: (type: string) => string
  formData: FormScreenData
  onFormDataUpdate: (updates: Partial<FormScreenData>) => void
  onLocationRequest: () => void
  onContinue: () => void
  onBack: () => void
  isLoadingLocation?: boolean
  continueButtonAriaLabel: string
  isMultiType?: boolean
  /** Индикатор шага онбординга (например, шаг 2 из 3) */
  step?: number
  totalSteps?: number
}

export const FormScreen = memo(function FormScreen({
  title,
  description,
  nameLabel,
  namePlaceholder,
  typeLabel,
  types,
  getTypeLabel,
  formData,
  onFormDataUpdate,
  onLocationRequest,
  onContinue,
  onBack,
  isLoadingLocation = false,
  continueButtonAriaLabel,
  isMultiType = false,
  step,
  totalSteps,
}: FormScreenProps) {
  const { t } = useTranslation()
  const showProgress = step != null && totalSteps != null && totalSteps > 0

  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

  const handleContinue = () => {
    const hasType = isMultiType ? formData.types.length > 0 : !!formData.type
    if (!formData.name.trim() || !hasType || !formData.city.trim()) {
      return
    }
    onContinue()
  }

  const isFormValid = (() => {
    const hasType = isMultiType ? formData.types.length > 0 : formData.type !== null
    return formData.name.trim() !== '' && hasType && formData.city.trim() !== ''
  })()

  return (
    <div className=" bg-background flex flex-col px-6 py-12">
      {showProgress && <OnboardingProgress current={step} total={totalSteps} className="mb-6" />}
      <SectionHeader title={title} description={description} className="mb-8" />

      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Поле названия */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FormField label={nameLabel}>
            <Input
              type="text"
              value={formData.name}
              onChange={e => onFormDataUpdate({ name: e.target.value })}
              placeholder={namePlaceholder}
            />
          </FormField>
        </motion.div>

        {/* Выбор типа */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FormField label={typeLabel}>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <SelectableTagButton
                  key={type}
                  value={type}
                  label={getTypeLabel(type)}
                  isSelected={isMultiType ? formData.types.includes(type) : formData.type === type}
                  onClick={value => {
                    if (!isMultiType) {
                      onFormDataUpdate({ type: value })
                      return
                    }

                    const nextTypes = formData.types.includes(value)
                      ? formData.types.filter(item => item !== value)
                      : [...formData.types, value]
                    onFormDataUpdate({ types: nextTypes })
                  }}
                  ariaLabel={t('aria.selectType', { label: getTypeLabel(type) })}
                />
              ))}
            </div>
          </FormField>
        </motion.div>

        {/* Поле города */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <LocationField
            value={formData.city}
            onChange={(value: string) => onFormDataUpdate({ city: value })}
            onLocationRequest={onLocationRequest}
            isLoading={isLoadingLocation}
          />
        </motion.div>
      </div>

      {/* Кнопка продолжения */}
      <div className="max-w-md mx-auto w-full mt-8 pb-8">
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          variant="gradient"
          className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
          size="lg"
          aria-label={continueButtonAriaLabel}
        >
          {t('common.continue')}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4 opacity-70">
          {t('profile.fillLaterHint')}
        </p>
      </div>
    </div>
  )
})
