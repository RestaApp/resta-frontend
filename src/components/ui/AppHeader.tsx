import { motion } from 'motion/react'
import { useUserProfile } from '../../hooks/useUserProfile'
import type { JSX } from 'react'
import { ThemeToggleCompact } from './ThemeToggle'

interface AppHeaderProps {
    greetingName?: string
}

export const AppHeader = ({ greetingName }: AppHeaderProps): JSX.Element => {
    const { userProfile } = useUserProfile()
    const sourceName = greetingName ?? userProfile?.full_name ?? userProfile?.name
    const name = sourceName ? String(sourceName).split(' ')[0] : 'Пользователь'

    return (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white">
                        {name?.[0] ?? ''}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Привет, {name} 👋</p>
                    </div>
                </div>
                <ThemeToggleCompact />
            </div>
        </motion.div>
    )
}


