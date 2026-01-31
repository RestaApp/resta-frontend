import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from '@/hooks/useTheme'

export const ThemeToggleCompact = () => {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()

    const containerRef = useRef<HTMLDivElement>(null)
    const lightButtonRef = useRef<HTMLButtonElement>(null)
    const darkButtonRef = useRef<HTMLButtonElement>(null)

    const [indicator, setIndicator] = useState({ left: 0, width: 0 })

    useEffect(() => {
        const active = theme === 'light' ? lightButtonRef.current : darkButtonRef.current
        const container = containerRef.current
        if (!active || !container) return

        const c = container.getBoundingClientRect()
        const r = active.getBoundingClientRect()
        setIndicator({ left: r.left - c.left, width: r.width })
    }, [theme])

    const setLight = useCallback(() => setTheme('light'), [setTheme])
    const setDark = useCallback(() => setTheme('dark'), [setTheme])

    return (
        <div ref={containerRef} className="relative inline-flex rounded-full border border-border bg-muted p-1">
            <motion.div
                className="absolute bottom-1 top-1 rounded-full"
                style={{ background: 'var(--gradient-primary)' }}
                initial={false}
                animate={{ left: indicator.left, width: indicator.width }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            <button
                ref={lightButtonRef}
                type="button"
                onClick={setLight}
                className="relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors"
                style={{ color: theme === 'light' ? 'white' : 'var(--muted-foreground)' }}
                aria-pressed={theme === 'light'}
                aria-label={t('aria.lightTheme')}
            >
                <Sun className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
                ref={darkButtonRef}
                type="button"
                onClick={setDark}
                className="relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors"
                style={{ color: theme === 'dark' ? 'white' : 'var(--muted-foreground)' }}
                aria-pressed={theme === 'dark'}
                aria-label={t('aria.darkTheme')}
            >
                <Moon className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    )
}