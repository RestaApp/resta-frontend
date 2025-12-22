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
  const { userProfile } = useUserProfile()
  const { updateUser } = useUpdateUser()
  const userData = useAppSelector(state => state.user.userData)
  const userId = userData?.id || userProfile?.id

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [workExperienceSummary, setWorkExperienceSummary] = useState('')
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [skillsInput, setSkillsInput] = useState('')
  const [openToWork, setOpenToWork] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEmployee = userProfile?.role === 'employee'
  const { positionsApi } = useUserPositions({ enabled: isEmployee && open })

  // Получаем текущую позицию для загрузки специализаций
  // Всегда используем position из state (может быть изменен пользователем)
  // Если position пустой, используем значение из userProfile
  const currentPositionForSpecializations =
    position || userProfile?.position || userProfile?.employee_profile?.position || null
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
      setSelectedSpecializations(userProfile.employee_profile?.specializations || [])
      setBio(userProfile.bio || '')
      setEmail(userProfile.email || '')
      setPhone(userProfile.phone || '')
      setLocation(userProfile.location || '')
      setWorkExperienceSummary(userProfile.work_experience_summary || '')
      setExperienceYears(userProfile.employee_profile?.experience_years || 0)
      setSkillsInput((userProfile.employee_profile?.skills || []).join(', '))
      setOpenToWork(userProfile.employee_profile?.open_to_work || false)
    }
  }, [open, userProfile])

  // Сбрасываем специализации при изменении позиции
  useEffect(() => {
    if (
      position &&
      position !== (userProfile?.position || userProfile?.employee_profile?.position)
    ) {
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
      if (name !== (userProfile?.name || '')) {
        updateData.user.name = name
      }
      if (lastName !== (userProfile?.last_name || '')) {
        updateData.user.last_name = lastName
      }

      // Обновляем позицию для сотрудников, если она изменилась
      if (
        isEmployee &&
        position !== userProfile?.position &&
        position !== userProfile?.employee_profile?.position
      ) {
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

      // Обновляем bio
      if (bio !== (userProfile?.bio || '')) {
        updateData.user.bio = bio || null
      }

      // Обновляем email
      if (email !== (userProfile?.email || '')) {
        updateData.user.email = email || null
      }

      // Обновляем phone
      if (phone !== (userProfile?.phone || '')) {
        updateData.user.phone = phone || null
      }

      // Обновляем location
      if (location !== (userProfile?.location || '')) {
        updateData.user.location = location || null
      }

      // Обновляем work_experience_summary
      if (workExperienceSummary !== (userProfile?.work_experience_summary || '')) {
        updateData.user.work_experience_summary = workExperienceSummary || null
      }

      // Обновляем employee_profile для сотрудников
      if (isEmployee) {
        const currentExperienceYears = userProfile?.employee_profile?.experience_years || 0
        const currentOpenToWork = userProfile?.employee_profile?.open_to_work || false
        const currentSkills = userProfile?.employee_profile?.skills || []
        const skillsArray = skillsInput
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)

        const employeeProfileChanged =
          experienceYears !== currentExperienceYears ||
          openToWork !== currentOpenToWork ||
          skillsArray.length !== currentSkills.length ||
          !skillsArray.every(skill => currentSkills.includes(skill))

        if (employeeProfileChanged) {
          updateData.user.employee_profile_attributes = {
            experience_years: experienceYears,
            open_to_work: openToWork,
            skills: skillsArray,
          }
        }
      }

      // Проверяем, есть ли что обновлять
      if (
        Object.keys(updateData.user).length === 0 &&
        !updateData.user.employee_profile_attributes
      ) {
        onOpenChange(false)
        return
      }

      await updateUser(userId, updateData)

      // Данные уже обновлены в Redux через updateUser
      // refetch не нужен, так как useUserProfile использует данные из Redux

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Ошибка при обновлении профиля
    } finally {
      setIsSubmitting(false)
    }
  }, [
    userId,
    name,
    lastName,
    position,
    selectedSpecializations,
    bio,
    email,
    phone,
    location,
    workExperienceSummary,
    experienceYears,
    skillsInput,
    openToWork,
    userProfile,
    isEmployee,
    updateUser,
    onOpenChange,
    onSuccess,
  ])

  const handleCancel = useCallback(() => {
    // Сбрасываем форму
    if (userProfile) {
      setName(userProfile.name || '')
      setLastName(userProfile.last_name || '')
      setPosition(userProfile.position || userProfile.employee_profile?.position || '')
      setSelectedSpecializations(userProfile.employee_profile?.specializations || [])
      setBio(userProfile.bio || '')
      setEmail(userProfile.email || '')
      setPhone(userProfile.phone || '')
      setLocation(userProfile.location || '')
      setWorkExperienceSummary(userProfile.work_experience_summary || '')
      setExperienceYears(userProfile.employee_profile?.experience_years || 0)
      setSkillsInput((userProfile.employee_profile?.skills || []).join(', '))
      setOpenToWork(userProfile.employee_profile?.open_to_work || false)
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
            {/* Имя и фамилия */}
            <div>
              <label htmlFor="name-input" className="block text-sm font-medium mb-2">
                Имя
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Введите имя"
              />
            </div>

            <div>
              <label htmlFor="lastname-input" className="block text-sm font-medium mb-2">
                Фамилия
              </label>
              <input
                id="lastname-input"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Введите фамилию"
              />
            </div>

            {/* Био */}
            <div>
              <label htmlFor="bio-input" className="block text-sm font-medium mb-2">
                О себе
              </label>
              <textarea
                id="bio-input"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Расскажите о себе"
              />
            </div>

            {/* Контактная информация */}
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium mb-2">
                Телефон
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="+375 (XX) XXX-XX-XX"
              />
            </div>

            <div>
              <label htmlFor="location-input" className="block text-sm font-medium mb-2">
                Местоположение
              </label>
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Город, страна"
              />
            </div>

            {/* Опыт работы */}
            <div>
              <label htmlFor="work-experience-input" className="block text-sm font-medium mb-2">
                Опыт работы
              </label>
              <textarea
                id="work-experience-input"
                value={workExperienceSummary}
                onChange={e => setWorkExperienceSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Опишите ваш опыт работы"
              />
            </div>

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

            {isEmployee &&
              currentPositionForSpecializations &&
              specializations &&
              specializations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Специализации</label>
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

            {/* Опыт работы (годы) */}
            {isEmployee && (
              <div>
                <label htmlFor="experience-years-input" className="block text-sm font-medium mb-2">
                  Опыт работы (лет)
                </label>
                <input
                  id="experience-years-input"
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="0"
                />
              </div>
            )}

            {/* Навыки */}
            {isEmployee && (
              <div>
                <label htmlFor="skills-input" className="block text-sm font-medium mb-2">
                  Навыки (через запятую)
                </label>
                <input
                  id="skills-input"
                  type="text"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-3 text-base rounded-2xl border-2 border-yellow-400/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Навык 1, Навык 2, Навык 3"
                />
              </div>
            )}

            {/* Открыт к работе */}
            {isEmployee && (
              <div className="flex items-center gap-2">
                <input
                  id="open-to-work-checkbox"
                  type="checkbox"
                  checked={openToWork}
                  onChange={e => setOpenToWork(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <label
                  htmlFor="open-to-work-checkbox"
                  className="text-sm font-medium cursor-pointer"
                >
                  Открыт к работе
                </label>
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
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
