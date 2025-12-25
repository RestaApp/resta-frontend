import { useEffect, useState, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import { getInitialTheme, toggleTheme } from '../../utils/theme'

interface ThemeToggleProps {
    size?: number
}

export const ThemeToggle = ({ size = 20 }: ThemeToggleProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme())

    useEffect(() => {
        // синхронизируем локальный стейт с классом root (на случай внешних изменений)
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    const handleToggle = () => {
        const next = toggleTheme()
        setTheme(next)
    }

    return (
        <button
            onClick={handleToggle}
            aria-label="Переключить тему"
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
            <motion.div
                animate={{ rotate: theme === 'light' ? 0 : 180 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center"
            >
                {theme === 'light' ? <Moon className={`w-${size} h-${size}`} /> : <Sun className={`w-${size} h-${size}`} />}
            </motion.div>
        </button>
    )
}

export const ThemeToggleCompact = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme())
    const containerRef = useRef<HTMLDivElement>(null)
    const lightButtonRef = useRef<HTMLButtonElement>(null)
    const darkButtonRef = useRef<HTMLButtonElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const activeButton = theme === 'light' ? lightButtonRef.current : darkButtonRef.current
        const container = containerRef.current

        if (activeButton && container) {
            const containerRect = container.getBoundingClientRect()
            const buttonRect = activeButton.getBoundingClientRect()

            setIndicatorStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            })
        }
    }, [theme])

    const setLight = () => {
        if (theme === 'light') return
        toggleTheme() // toggleTheme will save next
        setTheme('light')
    }

    const setDark = () => {
        if (theme === 'dark') return
        toggleTheme()
        setTheme('dark')
    }

    return (
        <div
            ref={containerRef}
            className="relative inline-flex rounded-full bg-muted p-1 border border-border"
        >
            {/* Анимированный индикатор */}
            <motion.div
                className="absolute top-1 bottom-1 rounded-full"
                style={{
                    background: 'var(--gradient-primary)',
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
                initial={false}
                animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
            />

            <button
                ref={lightButtonRef}
                onClick={setLight}
                className="relative z-10 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300"
                style={{
                    color: theme === 'light' ? 'white' : 'var(--muted-foreground)',
                }}
                aria-pressed={theme === 'light'}
                aria-label="Выбрать светлую тему"
            >
                <Sun className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
                ref={darkButtonRef}
                onClick={setDark}
                className="relative z-10 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300"
                style={{
                    color: theme === 'dark' ? 'white' : 'var(--muted-foreground)',
                }}
                aria-pressed={theme === 'dark'}
                aria-label="Выбрать тёмную тему"
            >
                <Moon className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    )
}


