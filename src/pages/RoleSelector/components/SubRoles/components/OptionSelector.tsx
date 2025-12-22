/**
 * Переиспользуемый компонент для выбора опций (типы поставщиков, форматы ресторанов)
 */

import { memo, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { setupTelegramBackButton } from '../../../../../utils/telegram'
import { LoadingState } from './LoadingState'
import { cn } from '../../../../../utils/cn'
import {
    roleCardAnimation,
    checkIconAnimation,
    ANIMATION_DELAY_STEP,
} from '../../../../../constants/animations'
import type { JSX, ComponentType } from 'react'

export interface OptionItem {
    value: string
    label: string
    description: string
    icon: ComponentType<{ className?: string }>
    color: string
}

interface OptionSelectorProps {
    title: string
    description: string
    options: OptionItem[]
    selectedValue: string | null
    onSelect: (value: string) => void
    onContinue: () => void
    onBack: () => void
    isLoading?: boolean
    isFetching?: boolean
    continueButtonLabel?: string
    continueButtonAriaLabel?: string
    hintMessage?: string
}

export const OptionSelector = memo(function OptionSelector({
    title,
    description,
    options,
    selectedValue,
    onSelect,
    onContinue,
    onBack,
    isLoading = false,
    isFetching = false,
    continueButtonLabel = 'Продолжить',
    continueButtonAriaLabel,
    hintMessage,
}: OptionSelectorProps): JSX.Element {
    useEffect(() => {
        const cleanup = setupTelegramBackButton(() => {
            onBack()
        })
        return cleanup
    }, [onBack])

    const handleContinue = useCallback(() => {
        if (!selectedValue) {
            return
        }
        onContinue()
    }, [onContinue, selectedValue])

    if (isLoading || isFetching) {
        return <LoadingState message={`Загрузка ${title.toLowerCase()}...`} />
    }

    if (!isLoading && !isFetching && options.length === 0) {
        return <LoadingState message={`Не удалось загрузить ${title.toLowerCase()}`} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
            <div className="pt-6 pb-4 px-3">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">{title}</h1>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
            </div>

            <div className="flex-1 px-4 pb-32 overflow-y-auto">
                <div className="space-y-3 max-w-md mx-auto">
                    {options.map((option, index) => {
                        const Icon = option.icon
                        const isSelected = selectedValue === option.value

                        return (
                            <motion.button
                                key={option.value}
                                initial={roleCardAnimation.initial}
                                animate={roleCardAnimation.animate}
                                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                                onClick={() => onSelect(option.value)}
                                className={cn(
                                    'relative p-6 rounded-3xl text-left transition-all duration-300 w-full',
                                    isSelected
                                        ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
                                        : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
                                )}
                                aria-pressed={isSelected}
                                aria-label={`Выбрать: ${option.label}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
                                            option.color
                                        )}
                                    >
                                        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl mb-1 font-semibold">{option.label}</h3>
                                        <p className="text-sm text-muted-foreground leading-tight">
                                            {option.description}
                                        </p>
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
                        disabled={!selectedValue}
                        className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
                        size="lg"
                        aria-label={continueButtonAriaLabel || continueButtonLabel}
                    >
                        {continueButtonLabel}
                    </Button>

                    {selectedValue && hintMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-xs text-muted-foreground mt-3"
                        >
                            {hintMessage}
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    )
})

