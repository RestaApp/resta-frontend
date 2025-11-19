import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import logo from '../assets/icons/logo.svg'
import type { UserRole, EmployeeRole } from '../types'
import { Button } from './ui/button'
import { cn } from '../utils/cn'
import { MAIN_ROLES } from '../constants/roles'
import {
  roleCardAnimation,
  checkIconAnimation,
  logoAnimation,
  textAnimation,
  ANIMATION_DELAY_STEP,
  ANIMATION_DURATION,
} from '../constants/animations'
import { EmployeeSubRoleSelector } from './EmployeeSubRoleSelector'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

interface RoleCardProps {
  role: (typeof MAIN_ROLES)[number]
  isSelected: boolean
  index: number
  onSelect: (roleId: UserRole) => void
}

function RoleCard({ role, isSelected, index, onSelect }: RoleCardProps) {
  const Icon = role.icon

  const handleClick = useCallback(() => {
    onSelect(role.id)
  }, [role.id, onSelect])

  const cardClasses = cn(
    'relative p-6 rounded-3xl text-left transition-all duration-300 w-full',
    isSelected
      ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
      : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
  )

  const iconContainerClasses = cn(
    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
    role.color
  )

  return (
    <motion.button
      key={role.id}
      initial={roleCardAnimation.initial}
      animate={roleCardAnimation.animate}
      transition={{ delay: ANIMATION_DELAY_STEP * index }}
      onClick={handleClick}
      className={cardClasses}
      aria-pressed={isSelected}
      aria-label={`Выбрать роль: ${role.title}`}
    >
      <div className="flex items-center gap-4">
        <div className={iconContainerClasses}>
          <Icon className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl mb-1 font-semibold">{role.title}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{role.description}</p>
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
}

interface HeaderProps {
  logo: string
}

function Header({ logo }: HeaderProps) {
  return (
    <div className="pb-4 px-3 text-center">
      <motion.div
        initial={logoAnimation.initial}
        animate={logoAnimation.animate}
        transition={{ duration: ANIMATION_DURATION }}
        className="mb-4 pt-4 flex flex-col items-center"
      >
        <img src={logo} alt="Resta" className="w-40 h-40 mx-auto" width={160} height={160} />

        <motion.p
          initial={textAnimation.initial}
          animate={textAnimation.animate}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground w-80"
        >
          Профессиональная платформа для индустрии HoReCa
        </motion.p>
      </motion.div>
    </div>
  )
}

interface FooterProps {
  selectedRole: UserRole | null
  onContinue: () => void
}

function Footer({ selectedRole, onContinue }: FooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto">
      <div className="p-4 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl">
        <Button
          onClick={onContinue}
          disabled={!selectedRole}
          className="w-full h-14 rounded-2xl text-base shadow-lg disabled:opacity-40"
          size="lg"
          aria-label="Продолжить выбор роли"
        >
          Продолжить
        </Button>
      </div>
    </div>
  )
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)

  const handleRoleSelect = useCallback(
    (roleId: UserRole) => {
      setSelectedRole(roleId)
      // Если выбрали сотрудника, показываем экран подролей
      if (roleId === 'chef') {
        setShowEmployeeSubRoles(true)
      } else {
        // Для заведения и поставщика сразу выбираем роль
        onSelectRole(roleId)
      }
    },
    [onSelectRole]
  )

  const handleContinue = useCallback(() => {
    if (selectedRole === 'chef') {
      setShowEmployeeSubRoles(true)
    } else if (selectedRole) {
      onSelectRole(selectedRole)
    }
  }, [selectedRole, onSelectRole])

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole) => {
    setSelectedSubRole(subRole)
  }, [])

  const handleSubRoleContinue = useCallback(() => {
    if (selectedSubRole) {
      onSelectRole(selectedSubRole)
    }
  }, [selectedSubRole, onSelectRole])

  const handleBack = useCallback(() => {
    setShowEmployeeSubRoles(false)
    setSelectedSubRole(null)
  }, [])

  // Показываем экран выбора подроли для сотрудников
  if (showEmployeeSubRoles) {
    return (
      <EmployeeSubRoleSelector
        currentRole={selectedRole}
        onSelectSubRole={handleSubRoleSelect}
        selectedSubRole={selectedSubRole}
        onContinue={handleSubRoleContinue}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Header logo={logo} />

      <div className="flex-1 px-4 pb-32 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto">
          {MAIN_ROLES.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              index={index}
              onSelect={handleRoleSelect}
            />
          ))}
        </div>
      </div>

      <Footer selectedRole={selectedRole} onContinue={handleContinue} />
    </div>
  )
}
