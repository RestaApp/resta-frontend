/**
 * Переиспользуемый экран формы для ресторана и поставщика
 */

import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { SectionHeader } from '@/components/ui/section-header'
import { LocationField } from './LocationField'
import { Button } from '@/components/ui/button'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { setupTelegramBackButton } from '@/utils/telegram'

interface FormScreenData {
  name: string
  type: string | null
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
}: FormScreenProps) {
  const { t } = useTranslation()
  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

  const handleContinue = () => {
    if (!formData.name.trim() || !formData.type || !formData.city.trim()) {
      return
    }
    onContinue()
  }

  const isFormValid =
    formData.name.trim() !== '' && formData.type !== null && formData.city.trim() !== ''

  return (
    <div className=" bg-background flex flex-col px-6 py-12">
      <SectionHeader title={title} description={description} className="mb-8" />

      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Поле названия */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block mb-2 text-muted-foreground text-sm font-medium">
            {nameLabel}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => onFormDataUpdate({ name: e.target.value })}
            placeholder={namePlaceholder}
            className="w-full px-4 py-3 rounded-2xl border border-[#E0E0E0] bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm text-foreground"
          />
        </motion.div>

        {/* Выбор типа */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block mb-3 text-muted-foreground text-sm font-medium">
            {typeLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <SelectableTagButton
                key={type}
                value={type}
                label={getTypeLabel(type)}
                isSelected={formData.type === type}
                onClick={value => onFormDataUpdate({ type: value })}
                ariaLabel={t('aria.selectType', { label: getTypeLabel(type) })}
              />
            ))}
          </div>
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
