import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import { cn } from '@/shared/utils/cn'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const imageCache = new Set<string>()

const LoadedCtx = createContext(false)
const SetLoadedCtx = createContext<(v: boolean) => void>(() => {})

export const Avatar = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <SetLoadedCtx.Provider value={setLoaded}>
      <LoadedCtx.Provider value={loaded}>
        <div
          className={cn(
            'relative flex h-9 w-9 shrink-0 overflow-hidden',
            AVATAR_SHAPE_CLASS,
            className
          )}
        >
          {children}
        </div>
      </LoadedCtx.Provider>
    </SetLoadedCtx.Provider>
  )
}

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
  const setLoaded = useContext(SetLoadedCtx)
  const imgRef = useRef<HTMLImageElement>(null)
  const hasError = !!src && errorSrc === src

  useIsomorphicLayoutEffect(() => {
    if (!src || hasError) {
      setLoaded(false)
      return
    }
    if (imageCache.has(src) || imgRef.current?.complete) {
      imageCache.add(src)
      setLoaded(true)
    } else {
      setLoaded(false)
    }
  }, [src, hasError, setLoaded])

  if (!src || hasError) return null

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      fetchPriority="high"
      decoding="sync"
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
      onLoad={() => {
        imageCache.add(src)
        setLoaded(true)
      }}
      onError={() => {
        setErrorSrc(src)
        setLoaded(false)
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
}) => {
  const loaded = useContext(LoadedCtx)
  if (loaded) return null

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center',
        AVATAR_SHAPE_CLASS,
        className
      )}
    >
      {children}
    </div>
  )
}
