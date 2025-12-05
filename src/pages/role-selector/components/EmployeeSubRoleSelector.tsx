/**
 * Компонент выбора подроли сотрудника
 */

import { useEffect, useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../utils/cn'
import { setupTelegramBackButton } from '../../../utils/telegram'
import {
  roleCardAnimation,
  checkIconAnimation,
  ANIMATION_DELAY_STEP,
} from '../../../constants/animations'
import type { EmployeeRole, UserRole } from '../../../types'
import { mapEmployeeSubRolesFromApi } from '../../../utils/rolesMapper'

interface EmployeeSubRoleSelectorProps {
  currentRole: UserRole | null
  onSelectSubRole: (role: EmployeeRole, positionValue: string) => void
  selectedSubRole: EmployeeRole | null
  onContinue: () => void
  onBack: () => void
  employeeSubRoles?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

export function EmployeeSubRoleSelector({
  currentRole,
  onSelectSubRole,
  selectedSubRole,
  onContinue,
  onBack,
  employeeSubRoles,
  isLoading = false,
  isFetching = false,
}: EmployeeSubRoleSelectorProps) {
  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

  const handleContinue = useCallback(() => {
    const isDisabled = !selectedSubRole || selectedSubRole === currentRole

    if (isDisabled) {
      return
    }

    onContinue()
  }, [onContinue, selectedSubRole, currentRole])

  // Преобразуем данные из API в формат компонентов
  const subRoles = useMemo(() => {
    if (employeeSubRoles && employeeSubRoles.length > 0) {
      return mapEmployeeSubRolesFromApi(employeeSubRoles)
    }
    return []
  }, [employeeSubRoles])

  // Показываем загрузку, если данные загружаются
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Загрузка позиций...</p>
      </div>
    )
  }

  // Показываем сообщение, если данные не загрузились
  if (!isLoading && !isFetching && subRoles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Не удалось загрузить позиции</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <div className="pt-6 pb-4 px-3">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Выберите специализацию</h1>
          <p className="text-muted-foreground text-sm">Измените вашу роль в команде</p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-32 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto">
          {subRoles.map((subRole, index) => {
            const Icon = subRole.icon
            const isSelected = selectedSubRole === subRole.id
            const isCurrent = currentRole === subRole.id
            // Используем originalValue для уникальности ключей (важно для manager/support, которые маппятся на admin)
            const uniqueKey = subRole.originalValue || subRole.id

            return (
              <motion.button
                key={uniqueKey}
                initial={roleCardAnimation.initial}
                animate={roleCardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                onClick={() => onSelectSubRole(subRole.id, subRole.originalValue || subRole.id)}
                className={cn(
                  'relative p-6 rounded-3xl text-left transition-all duration-300 w-full',
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
                    : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
                )}
                aria-pressed={isSelected}
                aria-label={`Выбрать: ${subRole.title}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
                      subRole.color
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl mb-1 font-semibold">{subRole.title}</h3>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Текущая
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-tight">
                      {subRole.description}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={checkIconAnimation.initial}
                      animate={checkIconAnimation.animate}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                      aria-hidden="true"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto">
        <div className="p-4 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl">
          <Button
            onClick={handleContinue}
            disabled={!selectedSubRole || selectedSubRole === currentRole}
            className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
            size="lg"
            aria-label="Продолжить выбор подроли"
          >
            Продолжить
          </Button>

          {selectedSubRole && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-muted-foreground mt-3"
            >
              Вы можете изменить специализацию позже в настройках профиля
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}


