/**
 * Компонент выбора типа поставщика
 */

import { useCallback, useMemo, useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, Package, Wrench, Briefcase, Truck } from 'lucide-react'
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
    getSupplierTypeLabel,
    getSupplierTypeDescription,
} from '../../../constants/labels'

interface SupplierTypeSelectorProps {
    onSelectType: (typeValue: string) => void
    selectedType: string | null
    onContinue: () => void
    onBack: () => void
    supplierTypes?: RoleApiItem[]
    isLoading?: boolean
    isFetching?: boolean
}

/**
 * Маппинг типов поставщиков на иконки
 */
const TYPE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    products: Package,
    equipment: Wrench,
    services: Briefcase,
    logistics: Truck,
}

/**
 * Маппинг типов поставщиков на цвета
 */
const TYPE_COLOR_MAP: Record<string, string> = {
    products: 'from-blue-500 to-cyan-500',
    equipment: 'from-orange-500 to-red-500',
    services: 'from-green-500 to-emerald-500',
    logistics: 'from-purple-500 to-pink-500',
}


export function SupplierTypeSelector({
    onSelectType,
    selectedType,
    onContinue,
    onBack,
    supplierTypes,
    isLoading = false,
    isFetching = false,
}: SupplierTypeSelectorProps) {
    useEffect(() => {
        const cleanup = setupTelegramBackButton(() => {
            onBack()
        })
        return cleanup
    }, [onBack])

    const handleContinue = useCallback(() => {
        const isDisabled = !selectedType

        if (isDisabled) {
            return
        }

        onContinue()
    }, [onContinue, selectedType])

    // Преобразуем данные из API в формат компонентов
    const types = useMemo(() => {
        if (!supplierTypes || supplierTypes.length === 0) {
            return []
        }

        return supplierTypes.map(type => ({
            value: type.value,
            label: getSupplierTypeLabel(type.value),
            description: getSupplierTypeDescription(type.value),
            icon: TYPE_ICON_MAP[type.value] || Package,
            color: TYPE_COLOR_MAP[type.value] || 'from-indigo-500 to-blue-600',
        }))
    }, [supplierTypes])

    // Показываем загрузку, если данные загружаются
    if (isLoading || isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Загрузка типов поставщиков...</p>
            </div>
        )
    }

    // Показываем сообщение, если данные не загрузились
    if (!isLoading && !isFetching && types.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Не удалось загрузить типы поставщиков</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
            <div className="pt-6 pb-4 px-3">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Выберите тип поставщика</h1>
                    <p className="text-muted-foreground text-sm">Укажите, что вы предлагаете</p>
                </div>
            </div>

            <div className="flex-1 px-4 pb-32 overflow-y-auto">
                <div className="space-y-3 max-w-md mx-auto">
                    {types.map((type, index) => {
                        const Icon = type.icon
                        const isSelected = selectedType === type.value

                        return (
                            <motion.button
                                key={type.value}
                                initial={roleCardAnimation.initial}
                                animate={roleCardAnimation.animate}
                                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                                onClick={() => onSelectType(type.value)}
                                className={cn(
                                    'relative p-6 rounded-3xl text-left transition-all duration-300 w-full',
                                    isSelected
                                        ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
                                        : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
                                )}
                                aria-pressed={isSelected}
                                aria-label={`Выбрать: ${type.label}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
                                            type.color
                                        )}
                                    >
                                        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl mb-1 font-semibold">{type.label}</h3>
                                        <p className="text-sm text-muted-foreground leading-tight">{type.description}</p>
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
                        disabled={!selectedType}
                        className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
                        size="lg"
                        aria-label="Продолжить выбор типа поставщика"
                    >
                        Продолжить
                    </Button>

                    {selectedType && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-xs text-muted-foreground mt-3"
                        >
                            Вы можете изменить тип поставщика позже в настройках профиля
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    )
}

