import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { ThemeToggleCompact } from './ThemeToggle'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

interface AppHeaderProps {
    greetingName?: string
}

export const AppHeader = ({ greetingName }: AppHeaderProps) => {
    const { userProfile } = useUserProfile()

    const name = useMemo(() => {
        const sourceName = greetingName ?? userProfile?.full_name ?? userProfile?.name
        return sourceName ? String(sourceName).split(' ')[0] : 'Пользователь'
    }, [greetingName, userProfile?.full_name, userProfile?.name])

    return (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        {userProfile?.photo_url ? (
                            <AvatarImage src={userProfile.photo_url} alt={name} />
                        ) : (
                            <AvatarFallback className="gradient-primary text-white">
                                {name?.[0] ?? ''}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <p className="text-muted-foreground">Привет, {name} 👋</p>
                    </div>
                </div>
                <ThemeToggleCompact />
            </div>
        </motion.div>
    )
}


