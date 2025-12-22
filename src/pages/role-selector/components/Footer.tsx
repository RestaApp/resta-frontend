/**
 * Компонент футера страницы выбора роли
 */

import { Button } from '../../../components/ui/button'
import type { UserRole } from '../../../types'

interface FooterProps {
  selectedRole: UserRole | null
  onContinue: () => void
}

export function Footer({ selectedRole, onContinue }: FooterProps) {
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










