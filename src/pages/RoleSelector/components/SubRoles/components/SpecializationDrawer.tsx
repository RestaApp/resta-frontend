/**
 * Drawer для выбора специализаций и дополнительных данных
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import {
    Drawer,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '../../../../../components/ui/drawer'
import { getSpecializationLabel } from '../../../../../constants/labels'
import { ExperienceField, LocationField, OpenToWorkToggle } from './FormFields'
import type { EmployeeFormData } from '../hooks/useEmployeeSubRoleSelector'
import type { JSX } from 'react'

interface SpecializationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    specializations: string[]
    isLoading: boolean
    selectedSpecializations: string[]
    formData: EmployeeFormData
    onSpecializationToggle: (spec: string) => void
    onLocationRequest: () => void
    onFormDataUpdate: (updates: Partial<EmployeeFormData>) => void
    onDone: () => void
}

export const SpecializationDrawer = memo(function SpecializationDrawer({
    open,
    onOpenChange,
    title,
    specializations,
    isLoading,
    selectedSpecializations,
    formData,
    onSpecializationToggle,
    onLocationRequest,
    onFormDataUpdate,
    onDone,
}: SpecializationDrawerProps): JSX.Element {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>
                    {specializations.length === 1 ? 'Выберите специализацию' : 'Выберите одну или несколько специализаций'}
                </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
                {isLoading ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                        Загрузка специализаций...
                    </p>
                ) : specializations.length > 0 ? (
                    <>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {specializations.map(spec => (
                                <motion.button
                                    key={spec}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSpecializationToggle(spec)}
                                    className="px-4 py-2 rounded-full border-2 transition-all text-sm"
                                    style={{
                                        background: selectedSpecializations.includes(spec)
                                            ? 'var(--gradient-primary)'
                                            : 'transparent',
                                        borderColor: selectedSpecializations.includes(spec)
                                            ? 'transparent'
                                            : 'var(--border)',
                                        color: selectedSpecializations.includes(spec) ? 'white' : 'inherit',
                                    }}
                                >
                                    {getSpecializationLabel(spec)}
                                </motion.button>
                            ))}
                        </div>

                        <OptionalFields
                            formData={formData}
                            onLocationRequest={onLocationRequest}
                            onFormDataUpdate={onFormDataUpdate}
                        />
                    </>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">Специализации не найдены</p>
                )}
            </div>

            <DrawerFooter>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onDone}
                    disabled={selectedSpecializations.length === 0}
                    className="w-full py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: 'var(--gradient-primary)',
                    }}
                >
                    Готово
                </motion.button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                    Полные данные профиля вы сможете заполнить
                    позже в разделе «Профиль».
                </p>
            </DrawerFooter>
        </Drawer>
    )
})

interface OptionalFieldsProps {
    formData: EmployeeFormData
    onLocationRequest: () => void
    onFormDataUpdate: (updates: Partial<EmployeeFormData>) => void
}

const OptionalFields = memo(function OptionalFields({
    formData,
    onLocationRequest,
    onFormDataUpdate,
}: OptionalFieldsProps): JSX.Element {
    return (
        <div className="space-y-4 pt-4 border-t border-border">
            <ExperienceField
                value={formData.experienceYears}
                onChange={value => onFormDataUpdate({ experienceYears: value })}
            />
            <OpenToWorkToggle
                value={formData.openToWork}
                onChange={value => onFormDataUpdate({ openToWork: value })}
            />
            <LocationField
                value={formData.location}
                onChange={value => onFormDataUpdate({ location: value })}
                onLocationRequest={onLocationRequest}
            />
        </div>
    )
})
