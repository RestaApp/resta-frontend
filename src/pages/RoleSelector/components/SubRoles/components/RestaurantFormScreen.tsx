/**
 * Экран формы для ресторана с полями: название, тип заведения, город
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { SectionHeader } from '../../../../../components/ui/section-header'
import { LocationField } from './FormFields'
import { getRestaurantFormatLabel } from '../../../../../constants/labels'
import { Button } from '../../../../../components/ui/button'
import { SelectableTagButton } from './SelectableTagButton'
import { setupTelegramBackButton } from '../../../../../utils/telegram'
import { useEffect } from 'react'
import type { JSX } from 'react'

interface RestaurantFormData {
    name: string
    format: string | null
    city: string
}

interface RestaurantFormScreenProps {
    restaurantFormats: string[]
    formData: RestaurantFormData
    onFormDataUpdate: (updates: Partial<RestaurantFormData>) => void
    onLocationRequest: () => void
    onContinue: () => void
    onBack: () => void
    isLoadingLocation?: boolean
}

export const RestaurantFormScreen = memo(function RestaurantFormScreen({
    restaurantFormats,
    formData,
    onFormDataUpdate,
    onLocationRequest,
    onContinue,
    onBack,
    isLoadingLocation = false,
}: RestaurantFormScreenProps): JSX.Element {
    useEffect(() => {
        const cleanup = setupTelegramBackButton(() => {
            onBack()
        })
        return cleanup
    }, [onBack])

    const handleContinue = () => {
        if (!formData.name.trim() || !formData.format || !formData.city.trim()) {
            return
        }
        onContinue()
    }

    const isFormValid = formData.name.trim() !== '' && formData.format !== null && formData.city.trim() !== ''

    return (
        <div className="min-h-screen bg-background flex flex-col px-6 py-12">
            <SectionHeader
                title="Информация о ресторане"
                description="Заполните данные о вашем заведении"
                className="mb-8"
            />

            <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
                {/* Поле названия ресторана */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="block mb-2 text-muted-foreground text-sm font-medium">
                        Название ресторана
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => onFormDataUpdate({ name: e.target.value })}
                        placeholder="Введите название"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E0E0E0] bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm text-foreground"
                    />
                </motion.div>

                {/* Выбор типа заведения */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="block mb-3 text-muted-foreground text-sm font-medium">
                        Тип заведения
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {restaurantFormats.map(format => (
                            <SelectableTagButton
                                key={format}
                                value={format}
                                label={getRestaurantFormatLabel(format)}
                                isSelected={formData.format === format}
                                onClick={value => onFormDataUpdate({ format: value })}
                                ariaLabel={`Выбрать: ${getRestaurantFormatLabel(format)}`}
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
                        onChange={value => onFormDataUpdate({ city: value })}
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
                    className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
                    size="lg"
                    aria-label="Продолжить заполнение формы ресторана"
                >
                    Продолжить
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4 opacity-70">
                    Полные данные профиля вы сможете заполнить позже в разделе «Профиль».
                </p>
            </div>
        </div>
    )
})

