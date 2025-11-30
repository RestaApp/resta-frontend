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
import { useUpdateUser } from '../../../hooks/useUsers'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { getEmployeePositionLabel } from '../../../constants/labels'
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEmployee = userProfile?.role === 'employee'
    const { positionsApi } = useUserPositions({ enabled: isEmployee && open })

    // Загружаем данные пользователя при открытии диалога
    useEffect(() => {
        if (open && userProfile) {
            setName(userProfile.name || '')
            setLastName(userProfile.last_name || '')
            setPosition(userProfile.position || userProfile.employee_profile?.position || '')
        }
    }, [open, userProfile])

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
    }, [userId, name, lastName, position, userProfile, isEmployee, updateUser, refetch, onOpenChange, onSuccess])

    const handleCancel = useCallback(() => {
        // Сбрасываем форму
        if (userProfile) {
            setName(userProfile.name || '')
            setLastName(userProfile.last_name || '')
            setPosition(userProfile.position || userProfile.employee_profile?.position || '')
        }
        onOpenChange(false)
    }, [userProfile, onOpenChange])

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Редактировать профиль</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <Card className="p-4 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Имя
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Введите имя"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                                Фамилия
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Введите фамилию"
                            />
                        </div>

                        {isEmployee && positionsApi && positionsApi.length > 0 && (
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium mb-2">
                                    Позиция
                                </label>
                                <select
                                    id="position"
                                    value={position}
                                    onChange={e => setPosition(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Выберите позицию</option>
                                    {positionsApi.map(pos => (
                                        <option key={pos.value} value={pos.value}>
                                            {getEmployeePositionLabel(pos.label) || getEmployeePositionLabel(pos.value) || pos.label}
                                        </option>
                                    ))}
                                </select>
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

