import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { LogoWithText } from '@/components/ui/logo-with-text'
import { HERO_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'

// Свечение и фон — радиальными градиентами, а не `filter: blur`: блюр на слабом
// железе и в части WebView отключается/не рендерится и оставляет резкий квадрат,
// а градиент выглядит одинаково везде и не грузит GPU.
const LOGO_GLOW_BACKGROUND =
  'radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent) 0%, transparent 70%)'

const AMBIENT_BACKGROUND = [
  'radial-gradient(60% 45% at 50% 38%, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 70%)',
  'radial-gradient(80% 50% at 50% 115%, color-mix(in srgb, var(--warning) 10%, transparent) 0%, transparent 70%)',
].join(', ')

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()
  const breathe = !reduceMotion && !reduceVisualEffects

  const logoIcon = (
    <div className="relative size-22">
      <motion.div
        className="absolute -inset-8 rounded-full"
        style={{ background: LOGO_GLOW_BACKGROUND }}
        animate={breathe ? { opacity: [0.55, 0.9, 0.55], scale: [1, 1.12, 1] } : { opacity: 0.7 }}
        transition={
          breathe ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
        }
        aria-hidden="true"
        data-slot="loading-logo-glow"
      />

      {/* Орбита: радиус (44 + 20) больше полудиагонали плитки 88px (~62),
          чтобы дуга не проходила по её углам. */}
      <motion.div
        className="absolute -inset-5 rounded-full border-2 will-change-transform"
        style={{
          borderColor: 'color-mix(in srgb, var(--primary) 18%, transparent)',
          borderTopColor: 'var(--primary)',
        }}
        animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: 'linear' }
        }
        aria-hidden="true"
        data-slot="loading-logo-ring"
      />

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
    </div>
  )

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background"
      style={{ zIndex: Z_INDEX.boot }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: AMBIENT_BACKGROUND }}
        animate={breathe ? { opacity: [0.8, 1, 0.8] } : { opacity: 1 }}
        transition={
          breathe ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
        }
        aria-hidden="true"
        data-slot="loading-ambient"
      />

      <div className="relative z-10 flex flex-col items-center gap-8 ui-density-page">
        <LogoWithText
          icon={logoIcon}
          title="Resta"
          subtitle={t('loadingPage.subtitle')}
          iconClassName="mb-3"
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
