import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { LogoWithText } from '@/components/ui/logo-with-text'
import { HERO_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()
  const roleColorVar = 'var(--primary)'

  const logoIcon = (
    <div className="relative isolate">
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.5, scale: 1 }
            : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.3, 1] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className={cn('absolute inset-0 -z-10', reduceVisualEffects ? 'opacity-70' : 'blur-3xl')}
        style={{
          backgroundImage: 'var(--gradient-primary-glow)',
        }}
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

        <motion.div
          className="absolute -inset-2 rounded-[2rem] border-2"
          style={{
            borderColor: roleColorVar,
            borderTopColor: 'transparent',
          }}
          animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: 'linear' }
          }
          aria-hidden="true"
        />
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background"
      style={{ zIndex: Z_INDEX.boot }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={
            reduceMotion
              ? { scale: 1, opacity: 0.12, rotate: 0 }
              : { scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 180, 360] }
          }
          transition={
            reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: 'linear' }
          }
          className={cn(
            'absolute -left-1/2 -top-1/2 h-full w-full',
            reduceVisualEffects ? undefined : 'blur-3xl'
          )}
          style={{ backgroundImage: 'var(--gradient-primary-glow)' }}
          aria-hidden="true"
          data-slot="loading-primary-ambient"
        />
        <motion.div
          animate={
            reduceMotion
              ? { scale: 1, opacity: 0.12, rotate: 0 }
              : { scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1], rotate: [360, 180, 0] }
          }
          transition={
            reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: 'linear' }
          }
          className={cn(
            'absolute -bottom-1/2 -right-1/2 h-full w-full',
            reduceVisualEffects ? undefined : 'blur-3xl'
          )}
          style={{ backgroundImage: 'var(--gradient-warm-glow)' }}
          aria-hidden="true"
          data-slot="loading-warm-ambient"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 ui-density-page">
        <LogoWithText
          icon={logoIcon}
          title="Resta"
          subtitle={t('loadingPage.subtitle')}
          iconClassName="mb-0"
          titleClassName={cn(HERO_TITLE_CLASS, 'text-gradient-primary')}
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
