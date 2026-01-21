import { useState } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AddShiftButton } from '@/pages/Activity/components/AddShiftButton'
import AddShiftDrawer from '@/pages/Activity/components/AddShiftDrawer'
import type { Tab } from '@/types'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle-compact'

interface AppHeaderProps {
    greetingName?: string
    onAddShift?: () => void
    activeTab?: Tab
}

const getFirstName = (value: unknown): string => {
    const name = typeof value === 'string' ? value.trim() : ''
    if (!name) return 'Пользователь'
    return name.split(/\s+/)[0] ?? 'Пользователь'
}

export const AppHeader = ({ greetingName, onAddShift, activeTab }: AppHeaderProps) => {
    const { userProfile } = useUserProfile()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const name = getFirstName(greetingName ?? userProfile?.full_name ?? userProfile?.name)

    const isActivity = activeTab === 'activity'
    const isDrawerVisible = isActivity && drawerOpen

    const openDrawer = () => {
        if (!isActivity) return
        setDrawerOpen(true)
        onAddShift?.()
    }

    const onDrawerOpenChange = (open: boolean) => {
        // если ушли с activity — drawer не может быть открыт
        if (!isActivity) {
            setDrawerOpen(false)
            return
        }
        setDrawerOpen(open)
    }

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-card px-4 py-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            {userProfile?.photo_url ? (
                                <AvatarImage src={userProfile.photo_url} alt={name} />
                            ) : (
                                <AvatarFallback className="gradient-primary text-white">
                                    {name[0] ?? ''}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <p className="text-muted-foreground">Привет, {name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isActivity && <AddShiftButton onClick={openDrawer} />}
                        <ThemeToggleCompact />
                    </div>
                </div>
            </motion.header>

            {isActivity && (
                <AddShiftDrawer open={isDrawerVisible} onOpenChange={onDrawerOpenChange} />
            )}
        </>
    )
}