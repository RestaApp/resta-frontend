import { Suspense, type ReactNode } from 'react'
import { Loader } from '@/components/ui/loader'

interface PageSuspenseProps {
  children: ReactNode
  fallback?: ReactNode
}

export const PageSuspense = ({ children, fallback }: PageSuspenseProps) => (
  <Suspense
    fallback={
      fallback ?? (
        <div className="flex items-center justify-center ui-density-page ui-density-py">
          <Loader size="lg" />
        </div>
      )
    }
  >
    {children}
  </Suspense>
)
