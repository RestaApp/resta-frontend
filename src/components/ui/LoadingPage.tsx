import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { LogoWithText } from '@/components/ui/logo-with-text'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'

// Исходный дизайн экрана (весна 2026): размытое свечение за плиткой, рамка-«орбита»
// по форме плитки, крупный display-заголовок и медленно плывущие размытые пятна фона.
//
// Два правила, чтобы он выглядел так везде:
// 1. Никакого `will-change: transform` на элементах с `filter: blur` — iOS WebKit
//    обрезает блюр по границе слоя, и вместо свечения получается квадрат.
// 2. Там, где блюр отключён (`useReducedVisualEffects`), вместо непрозрачного
//    квадрата — радиальный градиент: тот же мягкий ореол без фильтра.

const ROLE_COLOR = 'var(--primary)'

const GLOW_FALLBACK_BACKGROUND = `radial-gradient(circle, color-mix(in srgb, ${ROLE_COLOR} 55%, transparent) 0%, transparent 70%)`

const AMBIENT_FALLBACK_BACKGROUND = [
  `radial-gradient(60% 45% at 18% 12%, color-mix(in srgb, ${ROLE_COLOR} 18%, transparent) 0%, transparent 70%)`,
  'radial-gradient(70% 50% at 85% 95%, color-mix(in srgb, var(--warning) 12%, transparent) 0%, transparent 70%)',
].join(', ')

const AMBIENT_TRANSITION = { duration: 8, repeat: Infinity, ease: 'linear' } as const

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()

  const logoIcon = (
    <div className="relative">
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.5, scale: 1 }
            : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.3, 1] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className={cn('absolute inset-0 -z-10', reduceVisualEffects ? 'rounded-full' : 'blur-3xl')}
        style={{
          background: reduceVisualEffects
            ? GLOW_FALLBACK_BACKGROUND
            : `color-mix(in srgb, ${ROLE_COLOR} 55%, transparent)`,
        }}
        aria-hidden="true"
        data-slot="loading-logo-glow"
      />

      <div className="relative mb-8 size-22">
        <motion.div
          className="absolute inset-0 grid place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-5xl font-extrabold text-white shadow-[var(--shadow-primary-cta)]"
          initial={reduceMotion ? false : { scale: 0.98 }}
          animate={reduceMotion ? { scale: 1 } : { scale: [0.985, 1, 0.985] }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          R
        </motion.div>

        {/* Рамка повторяет форму плитки (скруглённый квадрат), а не круг —
            круг проходил по её углам. */}
        <motion.div
          className="absolute -inset-2 rounded-[2rem] border-2"
          style={{ borderColor: ROLE_COLOR, borderTopColor: 'transparent' }}
          animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: 'linear' }
          }
          aria-hidden="true"
          data-slot="loading-logo-ring"
        />
      </div>
    </div>
  )

  const ambient = reduceVisualEffects ? (
    <div className="absolute inset-0" style={{ background: AMBIENT_FALLBACK_BACKGROUND }} />
  ) : (
    <>
      <motion.div
        animate={
          reduceMotion
            ? { scale: 1, opacity: 0.12, rotate: 0 }
            : { scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 180, 360] }
        }
        transition={reduceMotion ? { duration: 0 } : AMBIENT_TRANSITION}
        className="absolute -left-1/2 -top-1/2 h-full w-full blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
        data-slot="loading-primary-ambient"
      />
      <motion.div
        animate={
          reduceMotion
            ? { scale: 1, opacity: 0.12, rotate: 0 }
            : { scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1], rotate: [360, 180, 0] }
        }
        transition={reduceMotion ? { duration: 0 } : AMBIENT_TRANSITION}
        className="absolute -bottom-1/2 -right-1/2 h-full w-full blur-3xl"
        style={{ background: `linear-gradient(135deg, var(--warning) 0%, ${ROLE_COLOR} 100%)` }}
        data-slot="loading-warm-ambient"
      />
    </>
  )

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background"
      style={{ zIndex: Z_INDEX.boot }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {ambient}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 ui-density-page">
        <LogoWithText
          icon={logoIcon}
          title="Resta"
          subtitle={t('loadingPage.subtitle')}
          iconClassName="mb-0"
          titleClassName="font-display text-5xl tracking-tight text-gradient-primary"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 ui-density-page pb-7 text-center">
        <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground/70">
          {t('loadingPage.country')}
        </p>
      </div>
    </div>
  )
})
