import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../utils/cn'
import { setupTelegramBackButton } from '../utils/telegram'
import { EMPLOYEE_SUBROLES } from '../constants/roles'
import {
  roleCardAnimation,
  checkIconAnimation,
  ANIMATION_DELAY_STEP,
} from '../constants/animations'
import type { EmployeeRole, UserRole } from '../types'

interface EmployeeSubRoleSelectorProps {
  currentRole: UserRole | null
  onSelectSubRole: (role: EmployeeRole) => void
  selectedSubRole: EmployeeRole | null
  onContinue: () => void
  onBack: () => void
}

export function EmployeeSubRoleSelector({
  currentRole,
  onSelectSubRole,
  selectedSubRole,
  onContinue,
  onBack,
}: EmployeeSubRoleSelectorProps) {
  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

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
          {EMPLOYEE_SUBROLES.map((subRole, index) => {
            const Icon = subRole.icon
            const isSelected = selectedSubRole === subRole.id
            const isCurrent = currentRole === subRole.id

            return (
              <motion.button
                key={subRole.id}
                initial={roleCardAnimation.initial}
                animate={roleCardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                onClick={() => onSelectSubRole(subRole.id)}
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
            onClick={onContinue}
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
