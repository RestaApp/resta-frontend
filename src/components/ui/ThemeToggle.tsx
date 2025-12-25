import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import type { JSX } from 'react'
import { getInitialTheme, toggleTheme } from '../../utils/theme'

interface ThemeToggleProps {
    size?: number
}

export const ThemeToggle = ({ size = 20 }: ThemeToggleProps): JSX.Element => {
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

export const ThemeToggleCompact = (): JSX.Element => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme())

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

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
        <div className="inline-flex rounded-full bg-muted p-1 border border-border">
            <button
                onClick={setLight}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${theme === 'light' ? 'gradient-primary text-white' : 'text-muted-foreground'}`}
                aria-pressed={theme === 'light'}
                aria-label="Выбрать светлую тему"
            >
                <Sun className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
                onClick={setDark}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${theme === 'dark' ? 'gradient-primary text-white' : 'text-muted-foreground'}`}
                aria-pressed={theme === 'dark'}
                aria-label="Выбрать тёмную тему"
            >
                <Moon className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    )
}


