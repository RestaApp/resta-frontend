import { useState, useCallback, useEffect, useMemo } from 'react'
import { Drawer, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ChevronDown } from 'lucide-react'
import { useUpdateUser } from '@/hooks/useUsers'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { useCities } from '@/hooks/useCities'
import { mapRoleFromApi } from '@/utils/roles'
import { invalidateUserCache } from '@/utils/userData'
import { useAppDispatch } from '@/store/hooks'
import type { ApiRole } from '@/types'
import type { UpdateUserRequest } from '@/services/api/usersApi'

interface EditProfileDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export const EditProfileDrawer = ({ open, onOpenChange, onSuccess }: EditProfileDrawerProps) => {
    const { userProfile, refetch } = useUserProfile()
    const { updateUser, isLoading } = useUpdateUser()
    const { showToast } = useToast()
    const { cities, isLoading: isCitiesLoading } = useCities({ enabled: open })
    const dispatch = useAppDispatch()

    // Определяем роль
    const apiRole = useMemo<ApiRole | null>(() => {
        if (!userProfile?.role) return null
        return mapRoleFromApi(userProfile.role)
    }, [userProfile?.role])

    // Состояние формы
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [bio, setBio] = useState('')
    const [city, setCity] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [workExperienceSummary, setWorkExperienceSummary] = useState('')
    // Для employee
    const [experienceYears, setExperienceYears] = useState<number | ''>('')
    const [openToWork, setOpenToWork] = useState(false)
    const [skills, setSkills] = useState<string>('')

    // Инициализация формы при открытии
    useEffect(() => {
        if (open && userProfile) {
            setName(userProfile.name || '')
            setLastName(userProfile.last_name || '')
            setBio(userProfile.bio || '')
            setCity((userProfile as any).city || userProfile.location || '')
            setEmail(userProfile.email || '')
            setPhone(userProfile.phone || '')
            setWorkExperienceSummary(userProfile.work_experience_summary || '')

            // Для employee
            if (apiRole === 'employee' && userProfile.employee_profile) {
                setExperienceYears(userProfile.employee_profile.experience_years || '')
                setOpenToWork(userProfile.employee_profile.open_to_work || false)
                setSkills(userProfile.employee_profile.skills?.join(', ') || '')
            }
        }
    }, [open, userProfile, apiRole])

    // Обработка сохранения
    const handleSave = useCallback(async () => {
        if (!userProfile?.id) {
            showToast('Ошибка: пользователь не найден', 'error')
            return
        }

        try {
            const updateData: UpdateUserRequest = {
                user: {
                    name: name.trim() || undefined,
                    ...(apiRole === 'employee' && lastName.trim() && { last_name: lastName.trim() }),
                    bio: bio.trim() || null,
                    city: city.trim() || null,
                    email: email.trim() || null,
                    phone: phone.trim() || null,
                    work_experience_summary: workExperienceSummary.trim() || null,
                    ...(apiRole === 'employee' && {
                        employee_profile_attributes: {
                            ...(experienceYears !== '' && typeof experienceYears === 'number' && { experience_years: experienceYears }),
                            open_to_work: openToWork,
                            ...(skills.trim() && { skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0) }),
                        },
                    }),
                },
            }

            const result = await updateUser(userProfile.id, updateData)

            if (result.success && result.data) {
                showToast('Профиль успешно обновлен', 'success')
                // Принудительно инвалидируем кеш User, чтобы обновить данные везде
                invalidateUserCache(dispatch)
                // Закрываем drawer сразу после успешного сохранения
                onOpenChange(false)
                // Данные уже обновлены в Redux через useUpdateUser
                // Делаем refetch для синхронизации с сервером
                setTimeout(() => {
                    refetch().catch(() => {
                        // Игнорируем ошибки refetch, данные уже в Redux
                    })
                }, 300)
                onSuccess?.()
            } else {
                const errorMessage = result.errors?.join(', ') || 'Не удалось обновить профиль'
                showToast(errorMessage, 'error')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить профиль'
            showToast(errorMessage, 'error')
        }
    }, [userProfile, name, lastName, bio, city, email, phone, workExperienceSummary, experienceYears, openToWork, skills, apiRole, updateUser, showToast, refetch, onSuccess, onOpenChange])

    if (!userProfile) {
        return null
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerHeader>
                <DrawerTitle>Редактировать профиль</DrawerTitle>
                <DrawerDescription>Обновите информацию о себе</DrawerDescription>
            </DrawerHeader>

            <div className="px-4 space-y-4 pb-4">
                {/* Имя */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Имя {apiRole === 'restaurant' || apiRole === 'supplier' ? '/ Название' : ''} *
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Введите имя"
                        disabled={isLoading}
                    />
                </div>

                {/* Фамилия (только для сотрудников) */}
                {apiRole === 'employee' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Фамилия</label>
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Введите фамилию"
                            disabled={isLoading}
                        />
                    </div>
                )}

                {/* Описание */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Описание {apiRole === 'restaurant' ? 'о заведении' : apiRole === 'supplier' ? 'о компании' : 'о себе'}
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={`Введите описание ${apiRole === 'restaurant' ? 'о заведении' : apiRole === 'supplier' ? 'о компании' : 'о себе'}`}
                        disabled={isLoading}
                        rows={4}
                        className="w-full min-h-[100px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите email"
                        disabled={isLoading}
                    />
                </div>

                {/* Телефон */}
                <div>
                    <label className="block text-sm font-medium mb-2">Телефон</label>
                    <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Введите телефон"
                        disabled={isLoading}
                    />
                </div>

                {/* Опыт работы (для сотрудников) */}
                {apiRole === 'employee' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">Опыт работы (лет)</label>
                            <Input
                                type="number"
                                min="0"
                                max="50"
                                value={experienceYears}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setExperienceYears(val === '' ? '' : Number(val))
                                }}
                                placeholder="Введите опыт работы"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                            <div>
                                <label className="block text-sm font-medium mb-1">Открыт к работе</label>
                                <p className="text-xs text-muted-foreground">Готов рассматривать предложения</p>
                            </div>
                            <Switch
                                checked={openToWork}
                                onCheckedChange={setOpenToWork}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Навыки</label>
                            <Input
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="Введите навыки через запятую"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Например: работа с ножом, знание HACCP</p>
                        </div>
                    </>
                )}

                {/* Резюме/Опыт работы */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {apiRole === 'employee' ? 'Резюме' : 'Опыт работы'}
                    </label>
                    <textarea
                        value={workExperienceSummary}
                        onChange={(e) => setWorkExperienceSummary(e.target.value)}
                        placeholder={apiRole === 'employee' ? 'Опишите свой опыт работы' : 'Опишите опыт работы'}
                        disabled={isLoading}
                        rows={4}
                        className="w-full min-h-[100px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none"
                    />
                </div>

                {/* Город из справочника */}
                <div>
                    <label className="block text-sm font-medium mb-2">Город</label>
                    {isCitiesLoading ? (
                        <div className="text-sm text-muted-foreground py-2">Загрузка городов...</div>
                    ) : (
                        <div className="relative">
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={isLoading}
                                className="w-full h-11 rounded-xl border border-border/50 px-4 pr-10 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 appearance-none"
                            >
                                <option value="">Выберите город</option>
                                {cities.map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <ChevronDown className="w-4 h-4" />
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <DrawerFooter>
                <Button
                    onClick={handleSave}
                    disabled={isLoading || !name.trim()}
                    className="w-full"
                    variant="primary"
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                >
                    Отмена
                </Button>
            </DrawerFooter>
        </Drawer>
    )
}
