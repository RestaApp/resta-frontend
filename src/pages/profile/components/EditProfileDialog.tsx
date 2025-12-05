/**
 * Компонент редактирования профиля
 */

import { useState, useCallback, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import { ChevronDown } from 'lucide-react'
import { useUpdateUser } from '../../../hooks/useUsers'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { useUserSpecializations } from '../../../hooks/useUserSpecializations'
import { getEmployeePositionLabel, getSpecializationLabel } from '../../../constants/labels'
import type { UpdateUserRequest } from '../../../services/api/usersApi'
import { useAppSelector } from '../../../store/hooks'

interface EditProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditProfileDialog({ open, onOpenChange, onSuccess }: EditProfileDialogProps) {
    const { userProfile, refetch } = useUserProfile()
    const { updateUser } = useUpdateUser()
    const userData = useAppSelector(state => state.user.userData)
    const userId = userData?.id || userProfile?.id

    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [position, setPosition] = useState('')
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEmployee = userProfile?.role === 'employee'
    const { positionsApi } = useUserPositions({ enabled: isEmployee && open })

    // Получаем текущую позицию для загрузки специализаций
    // Всегда используем position из state (может быть изменен пользователем)
    // Если position пустой, используем значение из userProfile
    const currentPositionForSpecializations = position || userProfile?.position || userProfile?.employee_profile?.position || null
    const { specializations } = useUserSpecializations({
        position: currentPositionForSpecializations,
        enabled: isEmployee && open && !!currentPositionForSpecializations,
    })

    // Загружаем данные пользователя при открытии диалога
    useEffect(() => {
        if (open && userProfile) {
            setName(userProfile.name || '')
            setLastName(userProfile.last_name || '')
            setPosition(userProfile.position || userProfile.employee_profile?.position || '')
            // Загружаем массив специализаций из employee_profile
            setSelectedSpecializations(userProfile.employee_profile?.specializations || [])
        }
    }, [open, userProfile])

    // Сбрасываем специализации при изменении позиции
    useEffect(() => {
        if (position && position !== (userProfile?.position || userProfile?.employee_profile?.position)) {
            setSelectedSpecializations([])
        }
    }, [position, userProfile])

    const handleSubmit = useCallback(async () => {
        if (!userId) {
            return
        }

        setIsSubmitting(true)

        try {
            const updateData: UpdateUserRequest = {
                user: {},
            }

            // Обновляем имя и фамилию, если они изменились
            if (name !== userProfile?.name) {
                updateData.user.name = name
            }
            if (lastName !== userProfile?.last_name) {
                updateData.user.last_name = lastName
            }

            // Обновляем позицию для сотрудников, если она изменилась
            if (isEmployee && position !== userProfile?.position && position !== userProfile?.employee_profile?.position) {
                updateData.user.position = position
            }

            // Обновляем специализации, если они изменились
            const currentSpecializations = userProfile?.employee_profile?.specializations || []
            const specializationsChanged =
                selectedSpecializations.length !== currentSpecializations.length ||
                !selectedSpecializations.every(spec => currentSpecializations.includes(spec))

            if (specializationsChanged) {
                updateData.user.specializations = selectedSpecializations
            }

            // Проверяем, есть ли что обновлять
            if (Object.keys(updateData.user).length === 0) {
                onOpenChange(false)
                return
            }

            await updateUser(userId, updateData)

            // Обновляем данные профиля
            await refetch()

            onOpenChange(false)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            // Ошибка при обновлении профиля
        } finally {
            setIsSubmitting(false)
        }
    }, [userId, name, lastName, position, selectedSpecializations, userProfile, isEmployee, updateUser, refetch, onOpenChange, onSuccess])

    const handleCancel = useCallback(() => {
        // Сбрасываем форму
        if (userProfile) {
            setName(userProfile.name || '')
            setLastName(userProfile.last_name || '')
            setPosition(userProfile.position || userProfile.employee_profile?.position || '')
            setSelectedSpecializations(userProfile.employee_profile?.specializations || [])
        }
        onOpenChange(false)
    }, [userProfile, onOpenChange])

    const handleSpecializationToggle = useCallback((specValue: string) => {
        setSelectedSpecializations(prev => {
            if (prev.includes(specValue)) {
                return prev.filter(s => s !== specValue)
            } else {
                return [...prev, specValue]
            }
        })
    }, [])

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Редактировать профиль</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <Card className="p-4 space-y-4">


                        {isEmployee && positionsApi && positionsApi.length > 0 && (
                            <div>
                                <label htmlFor="position-select" className="block text-sm font-medium mb-2">
                                    Позиция
                                </label>
                                <div className="relative">
                                    <select
                                        id="position-select"
                                        value={position}
                                        onChange={e => setPosition(e.target.value)}
                                        className="w-full px-3 py-3 text-base font-semibold rounded-2xl border-2 border-yellow-400/60 bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    >
                                        <option value="">Выберите позицию</option>
                                        {positionsApi.map(pos => {
                                            const label = getEmployeePositionLabel(pos)
                                            return (
                                                <option key={pos} value={pos}>
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground" />
                                </div>
                            </div>
                        )}

                        {isEmployee && currentPositionForSpecializations && specializations && specializations.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Специализации
                                </label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {specializations.map(spec => {
                                        const isChecked = selectedSpecializations.includes(spec)
                                        const label = getSpecializationLabel(spec)
                                        return (
                                            <label
                                                key={spec}
                                                className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleSpecializationToggle(spec)}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                                                />
                                                <span className="text-sm">{label}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

