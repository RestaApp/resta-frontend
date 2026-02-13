/**
 * Drawer для выбора специализаций и дополнительных данных
 */

import { memo, useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui'
import { Loader } from '@/components/ui/loader'
import { useLabels } from '@/shared/i18n/hooks'
import { ExperienceField, LocationField } from './index'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { cn } from '@/utils/cn'
import type { EmployeeFormData } from '../../../../model/useEmployeeSubRoleSelector'

const MAIN_SPEC_COUNT = 6

interface SpecializationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  specializations: string[]
  isLoading: boolean
  isLoadingLocation?: boolean
  selectedSpecializations: string[]
  formData: EmployeeFormData
  onSpecializationToggle: (spec: string) => void
  onLocationRequest: () => void
  onFormDataUpdate: (updates: Partial<EmployeeFormData>) => void
  onDone: () => void
  errorDialogOpen?: boolean
}

export const SpecializationDrawer = memo(function SpecializationDrawer({
  open,
  onOpenChange,
  title,
  specializations,
  isLoading,
  isLoadingLocation = false,
  selectedSpecializations,
  formData,
  onSpecializationToggle,
  onLocationRequest,
  onFormDataUpdate,
  onDone,
  errorDialogOpen = false,
}: SpecializationDrawerProps) {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const [additionalExpanded, setAdditionalExpanded] = useState(false)

  const mainSpecs = useMemo(() => specializations.slice(0, MAIN_SPEC_COUNT), [specializations])
  const additionalSpecs = useMemo(() => specializations.slice(MAIN_SPEC_COUNT), [specializations])
  const hasAdditional = additionalSpecs.length > 0

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && errorDialogOpen) return
      onOpenChange(next)
    },
    [errorDialogOpen, onOpenChange]
  )

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} preventClose={errorDialogOpen}>
      <DrawerHeader>
        <DrawerTitle>{title}</DrawerTitle>
        {specializations.length > 0 && (
          <DrawerDescription>
            {specializations.length === 1
              ? t('shift.selectSpecialization')
              : t('shift.selectSpecializations')}
          </DrawerDescription>
        )}
      </DrawerHeader>

      <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="md" />
          </div>
        ) : (
          <>
            {specializations.length > 0 ? (
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t('roles.specializationsMain')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mainSpecs.map(spec => (
                      <SelectableTagButton
                        key={spec}
                        value={spec}
                        label={getSpecializationLabel(spec)}
                        isSelected={selectedSpecializations.includes(spec)}
                        onClick={onSpecializationToggle}
                        ariaLabel={t('aria.selectSpecialization', {
                          label: getSpecializationLabel(spec),
                        })}
                      />
                    ))}
                  </div>
                </div>
                {hasAdditional ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setAdditionalExpanded(v => !v)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
                      )}
                      aria-expanded={additionalExpanded}
                    >
                      {t('roles.specializationsMore')}
                      {additionalExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {additionalExpanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 pt-2">
                            {additionalSpecs.map(spec => (
                              <SelectableTagButton
                                key={spec}
                                value={spec}
                                label={getSpecializationLabel(spec)}
                                isSelected={selectedSpecializations.includes(spec)}
                                onClick={onSpecializationToggle}
                                ariaLabel={t('aria.selectSpecialization', {
                                  label: getSpecializationLabel(spec),
                                })}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              className={`space-y-5 ${specializations.length > 0 ? 'pt-4 border-t border-border' : ''}`}
            >
              <ExperienceField
                value={formData.experienceYears}
                onChange={(v: number) => onFormDataUpdate({ experienceYears: v })}
              />
              <LocationField
                value={formData.location}
                onChange={(v: string) => onFormDataUpdate({ location: v })}
                onLocationRequest={onLocationRequest}
                isLoading={isLoadingLocation}
              />
            </div>
          </>
        )}
      </div>

      <DrawerFooter>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onDone}
          disabled={specializations.length > 0 && selectedSpecializations.length === 0}
          className="w-full py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed gradient-primary"
        >
          {t('common.done')}
        </motion.button>
        <p className="text-center text-xs text-muted-foreground mt-4 opacity-70">
          {t('profile.fillLaterHint')}
        </p>
      </DrawerFooter>
    </Drawer>
  )
})
