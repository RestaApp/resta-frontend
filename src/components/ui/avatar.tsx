import { useState } from 'react'
import { cn } from '@/utils/cn'

export const Avatar = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
    {children}
  </div>
)

export const AvatarImage = ({
  src,
  alt = '',
  className,
  onError,
}: {
  src?: string | null
  alt?: string
  className?: string
  onError?: () => void
}) => {
  const [errorSrc, setErrorSrc] = useState<string | null>(null)
  const hasError = !!src && errorSrc === src

  if (!src || hasError) return null

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('h-full w-full object-cover', className)}
      onError={() => {
        setErrorSrc(src)
        onError?.()
      }}
    />
  )
}

export const AvatarFallback = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-full', className)}>
    {children}
  </div>
)
