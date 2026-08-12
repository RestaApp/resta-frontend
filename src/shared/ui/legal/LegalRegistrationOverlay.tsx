import type { ReactNode } from 'react'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { cn } from '@/shared/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'

interface LegalRegistrationOverlayProps {
  children: ReactNode
}

/** Изолированный scroll-root для юридических документов поверх регистрации. */
export const LegalRegistrationOverlay = ({ children }: LegalRegistrationOverlayProps) => {
  const fullscreenOffset = useTelegramFullscreenOffset()

  return (
    <div
      data-legal-scroll-root
      className={cn(
        'fixed bottom-0 left-0 right-0 overflow-y-auto overscroll-y-contain touch-pan-y bg-background',
        fullscreenOffset.topClassName
      )}
      style={{ zIndex: Z_INDEX.boot }}
    >
      {children}
    </div>
  )
}
