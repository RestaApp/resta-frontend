import { useMemo, useCallback, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { User, Calendar, TrendingUp, Settings, HelpCircle, LogOut, Moon, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { mapRoleFromApi } from '@/utils/roles'
import { authService } from '@/services/auth'
import { useUser } from '@/hooks/useUser'
import { useToast } from '@/hooks/useToast'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'
import type { ApiRole } from '@/types'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

export const ProfilePage = () => {
    const { userProfile, isLoading: isProfileLoading, refetch } = useUserProfile()
    const { clearUserData } = useUser()
    const { showToast } = useToast()
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

    // Проверка флага для открытия drawer редактирования
    useEffect(() => {
        const shouldOpenEdit = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
        if (shouldOpenEdit === 'true') {
            setIsEditDrawerOpen(true)
            removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
        }

        // Слушаем событие для открытия drawer
        const handleOpenEdit = () => {
            setIsEditDrawerOpen(true)
        }

        window.addEventListener('openProfileEdit', handleOpenEdit)
        return () => {
            window.removeEventListener('openProfileEdit', handleOpenEdit)
        }
    }, [])

    // Получаем статистику смен
    const { data: myShiftsData } = useGetMyShiftsQuery()
    const myShifts = Array.isArray(myShiftsData) ? myShiftsData : (myShiftsData && (myShiftsData as any).data ? (myShiftsData as any).data : [])

    const { data: appliedShiftsData } = useGetAppliedShiftsQuery()
    const appliedShifts = Array.isArray(appliedShiftsData) ? appliedShiftsData : (appliedShiftsData && (appliedShiftsData as any).data ? (appliedShiftsData as any).data : [])

    // Определяем роль пользователя
    const apiRole = useMemo<ApiRole | null>(() => {
        if (!userProfile?.role) return null
        return mapRoleFromApi(userProfile.role)
    }, [userProfile?.role])

    // Статистика для сотрудника
    const employeeStats = useMemo(() => {
        const completedShifts = myShifts.filter((shift: any) => {
            if (!shift.start_time) return false
            const shiftDate = new Date(shift.start_time)
            return shiftDate < new Date()
        }).length

        const activeApplications = appliedShifts.filter((shift: any) => {
            const application = shift.my_application
            return application && application.status !== 'rejected' && application.status !== 'cancelled'
        }).length

        return {
            completedShifts,
            activeApplications,
        }
    }, [myShifts, appliedShifts])

    // Обработка выхода
    const handleLogout = useCallback(() => {
        authService.logout()
        clearUserData()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        showToast('Вы вышли из аккаунта', 'success')
        // Перезагружаем страницу для сброса состояния
        window.location.reload()
    }, [clearUserData, showToast])

    // Получаем имя пользователя
    const userName = useMemo(() => {
        if (!userProfile) return 'Пользователь'
        return userProfile.full_name || userProfile.name || 'Пользователь'
    }, [userProfile])

    // Получаем описание роли
    const roleLabel = useMemo(() => {
        if (apiRole === 'employee') {
            const position = userProfile?.position || userProfile?.employee_profile?.position
            return position ? getEmployeePositionLabel(position) : 'Сотрудник HoReCa'
        }
        if (apiRole === 'restaurant') return 'Ресторатор'
        if (apiRole === 'supplier') return 'Поставщик'
        return 'Пользователь'
    }, [apiRole, userProfile])

    // Получаем специализации
    const specializations = useMemo(() => {
        if (apiRole !== 'employee') return []
        return userProfile?.employee_profile?.specializations || []
    }, [apiRole, userProfile])

    // Получаем информацию о ресторане
    const restaurantInfo = useMemo(() => {
        if (apiRole !== 'restaurant') return null
        // Информация о ресторане может быть в restaurant_profile
        // Пока используем базовые данные
        return {
            name: userProfile?.full_name || userProfile?.name || 'Заведение',
            format: null, // Можно добавить позже
        }
    }, [apiRole, userProfile])

    // Получаем информацию о компании поставщика
    const supplierInfo = useMemo(() => {
        if (apiRole !== 'supplier') return null
        return {
            name: userProfile?.full_name || userProfile?.name || 'Компания',
        }
    }, [apiRole, userProfile])

    if (isProfileLoading) {
        return (
            <div className="pb-24 pt-6 px-4">
                <div className="text-center py-8 text-muted-foreground">Загрузка профиля...</div>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="pb-24 pt-6 px-4">
                <div className="text-center py-8 text-destructive">Ошибка загрузки профиля</div>
            </div>
        )
    }

    return (
        <div className="pb-24 pt-6 px-4 space-y-6">
            {/* Заголовок профиля */}
            <div className="text-center relative">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditDrawerOpen(true)}
                    className="absolute top-0 right-0 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Редактировать профиль"
                >
                    <Edit2 className="w-5 h-5" />
                </motion.button>
                <div
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'var(--gradient-primary)' }}
                >
                    {userProfile.profile_photo_url || userProfile.photo_url ? (
                        <img
                            src={userProfile.profile_photo_url || userProfile.photo_url || ''}
                            alt={userName}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-12 h-12 text-white" />
                    )}
                </div>
                <h2 className="text-xl font-semibold mb-1">{userName}</h2>
                <p className="text-muted-foreground">{roleLabel}</p>
            </div>

            {/* Статистика */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Статистика</h3>
                <div className="grid grid-cols-2 gap-4">
                    {apiRole === 'employee' && (
                        <>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                                    <div className="text-sm mb-1">Смен выполнено</div>
                                    <p className="text-lg font-semibold">{employeeStats.completedShifts}</p>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                                    <div className="text-sm mb-1">Активные отклики</div>
                                    <p className="text-lg font-semibold">{employeeStats.activeApplications}</p>
                                </div>
                            </Card>
                        </>
                    )}

                    {apiRole === 'restaurant' && (
                        <>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                                    <div className="text-sm mb-1">Смен создано</div>
                                    <p className="text-lg font-semibold">{myShifts.length}</p>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                                    <div className="text-sm mb-1">Активные заявки</div>
                                    <p className="text-lg font-semibold">{appliedShifts.length}</p>
                                </div>
                            </Card>
                        </>
                    )}

                    {apiRole === 'supplier' && (
                        <>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                                    <div className="text-sm mb-1">Просмотры</div>
                                    <p className="text-lg font-semibold">—</p>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-center py-2">
                                    <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                                    <div className="text-sm mb-1">Активные клиенты</div>
                                    <p className="text-lg font-semibold">—</p>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {/* Специализации для сотрудника */}
            {apiRole === 'employee' && specializations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Специализация</h3>
                    <div className="flex flex-wrap gap-2">
                        {specializations.map((spec: string) => (
                            <span
                                key={spec}
                                className="px-4 py-2 rounded-full text-white text-sm"
                                style={{ background: 'var(--gradient-primary)' }}
                            >
                                {getSpecializationLabel(spec)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Информация о пользователе */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Личная информация</h4>
                    {(() => {
                        // Обязательные поля для проверки полноты профиля
                        const hasPhone = !!userProfile.phone
                        const hasCity = !!(userProfile.location || (userProfile as any).city)
                        const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true // Для employee обязательно

                        // Проверяем, что все обязательные поля заполнены
                        const isFilled = hasPhone && hasCity && hasLastName

                        return (
                            <Badge
                                variant={isFilled ? 'success' : 'outline'}
                                className="flex items-center gap-1"
                            >
                                {isFilled ? (
                                    <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        Заполнено
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-3 h-3" />
                                        Нужно заполнить
                                    </>
                                )}
                            </Badge>
                        )
                    })()}
                </div>
                <div className="space-y-2 text-sm">
                    {(() => {
                        // Проверяем обязательные поля
                        const hasPhone = !!userProfile.phone
                        const hasCity = !!(userProfile.location || (userProfile as any).city)
                        const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true
                        const isFilled = hasPhone && hasCity && hasLastName

                        // Если не все обязательные поля заполнены - показываем кнопку
                        if (!isFilled) {
                            return (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground text-sm mb-2">
                                        Заполните обязательные поля профиля
                                    </p>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsEditDrawerOpen(true)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                                        style={{ background: 'var(--gradient-primary)' }}
                                    >
                                        Заполнить
                                    </motion.button>
                                </div>
                            )
                        }

                        // Если все обязательные поля заполнены - показываем информацию
                        return (
                            <>
                                {userProfile.bio && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Описание</span>
                                        <p className="text-foreground">{userProfile.bio}</p>
                                    </div>
                                )}
                                {(userProfile.location || (userProfile as any).city) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Город</span>
                                        <span>{(userProfile as any).city || userProfile.location}</span>
                                    </div>
                                )}
                                {apiRole === 'employee' && userProfile.last_name && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Фамилия</span>
                                        <span>{userProfile.last_name}</span>
                                    </div>
                                )}
                                {userProfile.email && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span>{userProfile.email}</span>
                                    </div>
                                )}
                                {userProfile.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Телефон</span>
                                        <span>{userProfile.phone}</span>
                                    </div>
                                )}
                                {userProfile.work_experience_summary && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">
                                            {apiRole === 'employee' ? 'Резюме' : 'Опыт работы'}
                                        </span>
                                        <p className="text-foreground">{userProfile.work_experience_summary}</p>
                                    </div>
                                )}
                                {apiRole === 'employee' && (
                                    <>
                                        {userProfile.employee_profile?.experience_years !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Опыт работы</span>
                                                <span>{userProfile.employee_profile.experience_years} {userProfile.employee_profile.experience_years === 1 ? 'год' : userProfile.employee_profile.experience_years < 5 ? 'года' : 'лет'}</span>
                                            </div>
                                        )}
                                        {userProfile.employee_profile?.open_to_work !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Открыт к работе</span>
                                                <span>{userProfile.employee_profile.open_to_work ? 'Да' : 'Нет'}</span>
                                            </div>
                                        )}
                                        {userProfile.employee_profile?.skills && userProfile.employee_profile.skills.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Навыки</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {userProfile.employee_profile.skills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 rounded-md bg-muted text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )
                    })()}
                </div>
            </Card>

            {/* Информация о ресторане */}
            {apiRole === 'restaurant' && restaurantInfo && (
                <Card className="p-4">
                    <h4 className="font-semibold mb-3">Информация о заведении</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Название</span>
                            <span>{restaurantInfo.name}</span>
                        </div>
                        {restaurantInfo.format && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Тип</span>
                                <span>{restaurantInfo.format}</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Информация о компании поставщика */}
            {apiRole === 'supplier' && supplierInfo && (
                <Card className="p-4">
                    <h4 className="font-semibold mb-3">Информация о компании</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Компания</span>
                            <span>{supplierInfo.name}</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* Настройки */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Настройки</h3>
                <div className="space-y-3">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
                                <div>
                                    <div className="text-sm font-medium">Тема оформления</div>
                                    <p className="text-xs text-muted-foreground">Светлая или темная тема</p>
                                </div>
                            </div>
                            <ThemeToggleCompact />
                        </div>
                    </Card>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                        <Settings className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
                        <span>Настройки уведомлений</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                        <HelpCircle className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
                        <span>Поддержка Resta</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Выйти из аккаунта</span>
                    </motion.button>
                </div>
            </div>

            {/* Drawer для редактирования профиля */}
            <EditProfileDrawer
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                onSuccess={() => {
                    refetch()
                }}
            />
        </div>
    )
}
