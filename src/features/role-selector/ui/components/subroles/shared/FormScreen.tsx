/**
 * Переиспользуемый экран формы для ресторана и поставщика
 */

import { memo, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { FormField } from '@/components/ui/form-field'
import { OnboardingProgress } from '../../OnboardingProgress'
import { LocationField } from './LocationField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { setupTelegramBackButton } from '@/utils/telegram'
import { cn } from '@/utils/cn'

type FormScreenTone = 'primary' | 'employee' | 'restaurant' | 'supplier'

const TONE_CTA: Record<FormScreenTone, string> = {
  primary: '',
  employee: 'bg-role-employee hover:bg-role-employee/90 active:bg-role-employee/80',
  restaurant: 'bg-role-restaurant hover:bg-role-restaurant/90 active:bg-role-restaurant/80',
  supplier: 'bg-role-supplier hover:bg-role-supplier/90 active:bg-role-supplier/80',
}

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
  const showProgress = step != null && totalSteps != null && totalSteps > 0
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

  return (
    <div className="bg-background min-h-[100dvh] flex flex-col">
      <div
        className={cn(
          'flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] overflow-y-auto',
          showFillLaterHint
            ? 'pb-[calc(8.75rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]'
            : 'pb-[calc(6.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]'
        )}
      >
        {showProgress && (
          <OnboardingProgress
            current={step}
            total={totalSteps}
            tone={tone === 'primary' ? undefined : tone}
            className="mb-[14px]"
          />
        )}
        <div className="mb-4">
          <h1 className="font-sans font-extrabold text-[22px] leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
            {title}
          </h1>
          <p className="text-meta leading-snug text-muted-foreground">{description}</p>
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
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
            <FormField label={typeLabel}>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <SelectableTagButton
                    key={type}
                    value={type}
                    label={getTypeLabel(type)}
                    tone={tone}
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-4 pt-3 pb-safe-cta backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            variant="gradient"
            className={cn('w-full shadow-lg disabled:opacity-40', TONE_CTA[tone])}
            size="lg"
            aria-label={continueButtonAriaLabel}
          >
            {t('common.continue')}
          </Button>
          {showFillLaterHint ? (
            <p className="text-center text-xs text-muted-foreground mt-3 opacity-70">
              {t('profile.fillLaterHint')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
})
