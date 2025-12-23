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
import { SelectableTagButton } from './SelectableTagButton'
import type { EmployeeFormData } from '../hooks/useEmployeeSubRoleSelector'
import type { JSX } from 'react'

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
}: SpecializationDrawerProps): JSX.Element {
    const handleOpenChange = (newOpen: boolean) => {
        // Предотвращаем закрытие drawer при открытом модальном окне ошибки
        if (!newOpen && errorDialogOpen) {
            return
        }
        onOpenChange(newOpen)
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange} preventClose={errorDialogOpen}>
            <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                {specializations.length > 0 && (
                    <DrawerDescription>
                        {specializations.length === 1
                            ? 'Выберите специализацию'
                            : 'Выберите одну или несколько специализаций'}
                    </DrawerDescription>
                )}
            </DrawerHeader>

            <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
                {isLoading ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                        Загрузка специализаций...
                    </p>
                ) : (
                    <>
                        {specializations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {specializations.map(spec => (
                                    <SelectableTagButton
                                        key={spec}
                                        value={spec}
                                        label={getSpecializationLabel(spec)}
                                        isSelected={selectedSpecializations.includes(spec)}
                                        onClick={onSpecializationToggle}
                                        ariaLabel={`Выбрать специализацию: ${getSpecializationLabel(spec)}`}
                                    />
                                ))}
                            </div>
                        )}

                        <OptionalFields
                            formData={formData}
                            onLocationRequest={onLocationRequest}
                            onFormDataUpdate={onFormDataUpdate}
                            isLoadingLocation={isLoadingLocation}
                            showSpecializations={specializations.length > 0}
                        />
                    </>
                )}
            </div>

            <DrawerFooter>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onDone}
                    disabled={specializations.length > 0 && selectedSpecializations.length === 0}
                    className="w-full py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: 'var(--gradient-primary)',
                    }}
                >
                    Готово
                </motion.button>
                <p className="text-center text-xs text-muted-foreground mt-4 opacity-70">
                    Полные данные профиля вы сможете заполнить позже в разделе «Профиль».
                </p>
            </DrawerFooter>
        </Drawer>
    )
})

interface OptionalFieldsProps {
    formData: EmployeeFormData
    onLocationRequest: () => void
    onFormDataUpdate: (updates: Partial<EmployeeFormData>) => void
    isLoadingLocation?: boolean
    showSpecializations?: boolean
}

const OptionalFields = memo(function OptionalFields({
    formData,
    onLocationRequest,
    onFormDataUpdate,
    isLoadingLocation = false,
    showSpecializations = false,
}: OptionalFieldsProps): JSX.Element {
    return (
        <div className={`space-y-5 ${showSpecializations ? 'pt-4 border-t border-border' : ''}`}>
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
                isLoading={isLoadingLocation}
            />
        </div>
    )
})
