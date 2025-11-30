/**
 * Компонент выбора формата ресторана
 */

import { useCallback, useMemo, useEffect } from 'react'
import { motion } from 'motion/react'
import {
    Check,
    UtensilsCrossed,
    Coffee,
    Store,
    ChefHat,
    Pizza,
    Croissant,
    Truck,
    Sparkles,
    Beer,
    Zap,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { setupTelegramBackButton } from '../../../utils/telegram'
import { cn } from '../../../utils/cn'
import {
    roleCardAnimation,
    checkIconAnimation,
    ANIMATION_DELAY_STEP,
} from '../../../constants/animations'
import type { RoleApiItem } from '../../../services/api/rolesApi'
import {
    getRestaurantFormatLabel,
    getRestaurantFormatDescription,
} from '../../../constants/labels'

interface RestaurantFormatSelectorProps {
    onSelectFormat: (formatValue: string) => void
    selectedFormat: string | null
    onContinue: () => void
    onBack: () => void
    restaurantFormats?: RoleApiItem[]
    isLoading?: boolean
    isFetching?: boolean
}

/**
 * Маппинг форматов ресторанов на иконки
 */
const FORMAT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    full_service: UtensilsCrossed,
    cafe: Coffee,
    sushi_bar: ChefHat,
    bistro: Store,
    fast_food: Zap,
    bar: Beer,
    pizzeria: Pizza,
    bakery: Croissant,
    food_truck: Truck,
    catering: Sparkles,
}

/**
 * Маппинг форматов ресторанов на цвета
 */
const FORMAT_COLOR_MAP: Record<string, string> = {
    full_service: 'from-orange-500 to-red-500',
    cafe: 'from-amber-500 to-orange-500',
    sushi_bar: 'from-blue-500 to-cyan-500',
    bistro: 'from-green-500 to-emerald-500',
    fast_food: 'from-yellow-500 to-orange-500',
    bar: 'from-purple-500 to-pink-500',
    pizzeria: 'from-red-500 to-orange-500',
    bakery: 'from-amber-400 to-yellow-500',
    food_truck: 'from-indigo-500 to-blue-500',
    catering: 'from-pink-500 to-rose-500',
}


export function RestaurantFormatSelector({
    onSelectFormat,
    selectedFormat,
    onContinue,
    onBack,
    restaurantFormats,
    isLoading = false,
    isFetching = false,
}: RestaurantFormatSelectorProps) {
    useEffect(() => {
        const cleanup = setupTelegramBackButton(() => {
            onBack()
        })
        return cleanup
    }, [onBack])

    const handleContinue = useCallback(() => {
        const isDisabled = !selectedFormat

        if (isDisabled) {
            return
        }

        onContinue()
    }, [onContinue, selectedFormat])

    // Преобразуем данные из API в формат компонентов
    const formats = useMemo(() => {
        if (!restaurantFormats || restaurantFormats.length === 0) {
            return []
        }

        return restaurantFormats.map(format => ({
            value: format.value,
            label: getRestaurantFormatLabel(format.value),
            description: getRestaurantFormatDescription(format.value),
            icon: FORMAT_ICON_MAP[format.value] || Store,
            color: FORMAT_COLOR_MAP[format.value] || 'from-orange-500 to-red-500',
        }))
    }, [restaurantFormats])

    // Показываем загрузку, если данные загружаются
    if (isLoading || isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Загрузка форматов ресторанов...</p>
            </div>
        )
    }

    // Показываем сообщение, если данные не загрузились
    if (!isLoading && !isFetching && formats.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Не удалось загрузить форматы ресторанов</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
            <div className="pt-6 pb-4 px-3">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Выберите формат ресторана</h1>
                    <p className="text-muted-foreground text-sm">Укажите тип вашего заведения</p>
                </div>
            </div>

            <div className="flex-1 px-4 pb-32 overflow-y-auto">
                <div className="space-y-3 max-w-md mx-auto">
                    {formats.map((format, index) => {
                        const Icon = format.icon
                        const isSelected = selectedFormat === format.value

                        return (
                            <motion.button
                                key={format.value}
                                initial={roleCardAnimation.initial}
                                animate={roleCardAnimation.animate}
                                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                                onClick={() => onSelectFormat(format.value)}
                                className={cn(
                                    'relative p-6 rounded-3xl text-left transition-all duration-300 w-full',
                                    isSelected
                                        ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
                                        : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
                                )}
                                aria-pressed={isSelected}
                                aria-label={`Выбрать: ${format.label}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
                                            format.color
                                        )}
                                    >
                                        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl mb-1 font-semibold">{format.label}</h3>
                                        <p className="text-sm text-muted-foreground leading-tight">{format.description}</p>
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            initial={checkIconAnimation.initial}
                                            animate={checkIconAnimation.animate}
                                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                                            aria-hidden="true"
                                        >
                                            <Check className="w-5 h-5 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto">
                <div className="p-4 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedFormat}
                        className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
                        size="lg"
                        aria-label="Продолжить выбор формата ресторана"
                    >
                        Продолжить
                    </Button>

                    {selectedFormat && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-xs text-muted-foreground mt-3"
                        >
                            Вы можете изменить формат ресторана позже в настройках профиля
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    )
}

