/**
 * Переключатель "В активном поиске"
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { AnimatedField } from './AnimatedField'

interface OpenToWorkToggleProps {
    value: boolean
    onChange: (value: boolean) => void
    withAnimation?: boolean
    animationDelay?: number
}

export const OpenToWorkToggle = memo(function OpenToWorkToggle({
    value,
    onChange,
    withAnimation = false,
    animationDelay = 0,
}: OpenToWorkToggleProps) {
    const { t } = useTranslation()
    const content = (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl">
                <span className="text-sm font-medium text-foreground">{t('roles.openToWork')}</span>
                <button
                    onClick={() => onChange(!value)}
                    className={cn(
                        'relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
                        value ? 'focus:ring-purple-500/50' : 'focus:ring-muted-foreground/50'
                    )}
                    style={{
                        background: value
                            ? 'var(--gradient-primary)'
                            : 'var(--switch-background)',
                    }}
                    aria-label={value ? t('roles.openToWorkAriaOff') : t('roles.openToWorkAriaOn')}
                >
                    <motion.div
                        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
                        animate={{
                            x: value ? 28 : 2,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                    />
                </button>
            </div>
            <p className="text-xs text-muted-foreground px-0.5">
                {t('roles.openToWorkHint')}
            </p>
        </div>
    )

    return (
        <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
            {content}
        </AnimatedField>
    )
})
