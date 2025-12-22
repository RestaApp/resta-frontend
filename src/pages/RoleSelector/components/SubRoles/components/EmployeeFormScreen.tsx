/**
 * Экран формы "Расскажите о себе"
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { Button } from '../../../../../components/ui/button'
import { cn } from '../../../../../utils/cn'
import { getSpecializationLabel } from '../../../../../constants/labels'
import { ExperienceField, LocationField, OpenToWorkToggle } from './FormFields'
import type { EmployeeFormData } from '../hooks/useEmployeeSubRoleSelector'
import type { JSX } from 'react'

interface EmployeeFormScreenProps {
  formData: EmployeeFormData
  specializations: string[]
  isLoadingSpecs: boolean
  onSpecializationToggle: (spec: string) => void
  onLocationRequest: () => void
  onFormDataUpdate: (updates: Partial<EmployeeFormData>) => void
  onContinue: () => void
}

export const EmployeeFormScreen = memo(function EmployeeFormScreen({
  formData,
  specializations,
  isLoadingSpecs,
  onSpecializationToggle,
  onLocationRequest,
  onFormDataUpdate,
  onContinue,
}: EmployeeFormScreenProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center text-2xl font-semibold text-foreground"
      >
        Расскажите о себе
      </motion.h2>

      <div className="flex-1 space-y-6 max-w-md mx-auto w-full overflow-y-auto pb-32">
        <SpecializationField
          specializations={specializations}
          selectedSpecializations={formData.specializations}
          isLoading={isLoadingSpecs}
          onToggle={onSpecializationToggle}
        />

        <ExperienceField
          value={formData.experienceYears}
          onChange={value => onFormDataUpdate({ experienceYears: value })}
          withAnimation
          animationDelay={0.2}
        />

        <LocationField
          value={formData.location}
          onChange={value => onFormDataUpdate({ location: value })}
          onLocationRequest={onLocationRequest}
          withAnimation
          animationDelay={0.3}
        />

        <OpenToWorkToggle
          value={formData.openToWork}
          onChange={value => onFormDataUpdate({ openToWork: value })}
          withAnimation
          animationDelay={0.4}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <div className="p-4 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl">
          <Button
            onClick={onContinue}
            disabled={formData.specializations.length === 0}
            className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
            size="lg"
            aria-label="Продолжить"
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  )
})

interface SpecializationFieldProps {
  specializations: string[]
  selectedSpecializations: string[]
  isLoading: boolean
  onToggle: (spec: string) => void
}

const SpecializationField = memo(function SpecializationField({
  specializations,
  selectedSpecializations,
  isLoading,
  onToggle,
}: SpecializationFieldProps): JSX.Element {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <label className="block mb-3 text-foreground font-medium">
        Ваша специализация <span className="text-destructive">*</span>
      </label>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Загрузка специализаций...</p>
      ) : specializations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {specializations.map(spec => {
            const isSelected = selectedSpecializations.includes(spec)
            return (
              <button
                key={spec}
                onClick={() => onToggle(spec)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 transition-all text-sm',
                  isSelected
                    ? 'border-transparent text-white'
                    : 'border-border text-foreground hover:border-primary/50'
                )}
                style={
                  isSelected
                    ? {
                      background: 'var(--gradient-primary)',
                    }
                    : undefined
                }
              >
                {getSpecializationLabel(spec)}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Специализации не найдены</p>
      )}
    </motion.div>
  )
})
