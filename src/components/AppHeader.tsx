import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { AddShiftButton } from '../pages/Activity/components/AddShiftButton'
import AddShiftDrawer from '@/pages/Activity/components/AddShiftDrawer'
import type { Tab } from '@/types'

interface AppHeaderProps {
    greetingName?: string
    onAddShift?: () => void
    activeTab?: Tab
}

export const AppHeader = ({ greetingName, onAddShift, activeTab }: AppHeaderProps) => {
    const { userProfile } = useUserProfile()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const name = useMemo(() => {
        const sourceName = greetingName ?? userProfile?.full_name ?? userProfile?.name
        return sourceName ? String(sourceName).split(' ')[0] : 'Пользователь'
    }, [greetingName, userProfile?.full_name, userProfile?.name])

    return (
        <>
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
                    <div className="flex items-center gap-2">
                        {activeTab === 'activity' && <AddShiftButton onClick={() => { setDrawerOpen(true); onAddShift?.() }} />}
                        {/* <ThemeToggleCompact /> */}
                    </div>
                </div>
            </motion.div>
            <AddShiftDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSave={(shift) => {
                // По умолчанию просто логируем созданную смену.
                // При необходимости здесь можно диспатчить в стор или вызывать API.
                // Оставляем простую реализацию, чтобы форма работала сразу.
                // eslint-disable-next-line no-console
                console.log('Создана личная смена:', shift)
            }} />
        </>
    )
}
