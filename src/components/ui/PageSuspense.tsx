import { Suspense, type ReactNode } from 'react'
import { Loader } from '@/components/ui/loader'

interface PageSuspenseProps {
  children: ReactNode
  /** Высота fallback (по умолчанию занимает page padding). */
  fallbackClassName?: string
}

/**
 * Shared Suspense fallback для lazy‑routes/screens.
 *
 * SRP: один источник истины для loader UI на page‑level.
 * При смене визуального паттерна loading screen — правится здесь, а не
 * в каждом потребителе lazy() компонента.
 */
export const PageSuspense = ({ children, fallbackClassName }: PageSuspenseProps) => (
  <Suspense
    fallback={
      <div
        className={
          fallbackClassName ?? 'flex items-center justify-center ui-density-page ui-density-py'
        }
      >
        <Loader size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
)
