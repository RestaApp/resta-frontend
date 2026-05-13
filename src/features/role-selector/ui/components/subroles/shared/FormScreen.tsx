/**
 * Переиспользуемый экран формы для ресторана и поставщика
 */

import { memo, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { FormField } from '@/components/ui/form-field'
import { LocationField } from './LocationField'
import { Input } from '@/components/ui/input'
import { TagGroup } from '@/shared/ui/TagGroup'
import { setupTelegramBackButton } from '@/utils/telegram'
import {
  OnboardingBottomCta,
  ONBOARDING_BOTTOM_CTA_SPACE,
  ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT,
} from '../../OnboardingBottomCta'
import { OnboardingSection, OnboardingStepLayout } from '../../OnboardingStepLayout'

type FormScreenTone = 'primary' | 'employee' | 'restaurant' | 'supplier'

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
  /** Доп. карточка-плашка под формой (например, DIRECT-режим / PRO trial) */
  footerCard?: ReactNode
  /** Цвет роли для активных тегов и CTA. */
  tone?: FormScreenTone
  /** Скрыть поле названия (если оно уже введено ранее). */
  hideName?: boolean
  /** Скрыть поле города (если уже введён на предыдущем шаге). */
  hideCity?: boolean
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
  footerCard,
  tone = 'primary',
  hideName = false,
  hideCity = false,
}: FormScreenProps) {
  const { t } = useTranslation()
  const showFillLaterHint = step === 3

  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

  const handleContinue = () => {
    const hasType = isMultiType ? formData.types.length > 0 : !!formData.type
    const nameOk = hideName || formData.name.trim() !== ''
    const cityOk = hideCity || formData.city.trim() !== ''
    if (!nameOk || !hasType || !cityOk) {
      return
    }
    onContinue()
  }

  const isFormValid = (() => {
    const hasType = isMultiType ? formData.types.length > 0 : formData.type !== null
    const nameOk = hideName || formData.name.trim() !== ''
    const cityOk = hideCity || formData.city.trim() !== ''
    return nameOk && hasType && cityOk
  })()

  const handleTypeToggle = (value: string) => {
    if (!isMultiType) {
      onFormDataUpdate({ type: value })
      return
    }

    const nextTypes = formData.types.includes(value)
      ? formData.types.filter(item => item !== value)
      : [...formData.types, value]
    onFormDataUpdate({ types: nextTypes })
  }

  return (
    <OnboardingStepLayout
      currentStep={step ?? 1}
      totalSteps={totalSteps ?? 1}
      title={title}
      subtitle={description}
      tone={tone}
      bottomSpace={
        showFillLaterHint ? ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT : ONBOARDING_BOTTOM_CTA_SPACE
      }
    >
      <div className="flex-1 flex flex-col gap-6 max-w-md w-full">
        {/* Поле названия */}
        {hideName ? null : (
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
        )}

        {/* Выбор типа */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <OnboardingSection label={typeLabel}>
            <TagGroup
              values={types}
              selectedValues={isMultiType ? formData.types : formData.type ? [formData.type] : []}
              onToggle={handleTypeToggle}
              getLabel={getTypeLabel}
              getAriaLabel={(_, label) => t('aria.selectType', { label })}
              tone={tone}
              size="lg"
            />
          </OnboardingSection>
        </motion.div>

        {/* Поле города */}
        {hideCity ? null : (
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
        )}

        {footerCard ? (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {footerCard}
          </motion.div>
        ) : null}
      </div>

      <OnboardingBottomCta
        onClick={handleContinue}
        disabled={!isFormValid}
        tone={tone}
        ariaLabel={continueButtonAriaLabel}
        showFillLaterHint={showFillLaterHint}
      >
        {t('common.continue')}
      </OnboardingBottomCta>
    </OnboardingStepLayout>
  )
})
