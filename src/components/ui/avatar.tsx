import { useState } from 'react'
import { cn } from '../../utils/cn'

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export function Avatar({ children, className }: AvatarProps) {
  return (
    <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
      {children}
    </div>
  )
}

interface AvatarImageProps {
  src?: string | null
  alt?: string
  className?: string
  onError?: () => void
}

export function AvatarImage({ src, alt = '', className, onError }: AvatarImageProps) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return null
  }

  const handleError = () => {
    setImgError(true)
    if (onError) {
      onError()
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      onError={handleError}
    />
  )
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-full', className)}>
      {children}
    </div>
  )
}
