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

const orbBackground = (color: string, alpha: number) =>
  `radial-gradient(circle, color-mix(in srgb, ${color} ${alpha}%, transparent) 0%, transparent 65%)`

/**
 * Плавающие пятна фона. Круглые радиальные градиенты (у них нет углов, которые
 * выдавали прежние квадратные блоки при вращении) медленно дрейфуют и дышат;
 * траектории замкнуты (первый кадр = последний), поэтому цикл без рывка.
 */
const AMBIENT_ORBS = [
  {
    className: 'left-[-30%] top-[-18%] size-[85vw]',
    background: orbBackground('var(--primary)', 34),
    duration: 16,
    path: { x: [0, 70, -30, 0], y: [0, 50, 90, 0], scale: [1, 1.15, 0.95, 1] },
  },
  {
    className: 'right-[-35%] bottom-[-22%] size-[95vw]',
    background: orbBackground('var(--primary)', 26),
    duration: 21,
    path: { x: [0, -80, 30, 0], y: [0, -60, -100, 0], scale: [1.05, 0.95, 1.15, 1.05] },
  },
  {
    className: 'left-[15%] top-[42%] size-[65vw]',
    background: orbBackground('var(--primary)', 16),
    duration: 25,
    path: { x: [0, -50, 60, 0], y: [0, 70, -40, 0], scale: [0.95, 1.1, 1, 0.95] },
  },
]

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
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {AMBIENT_ORBS.map((orb, index) => (
          <motion.div
            key={index}
            className={cn('absolute rounded-full will-change-transform', orb.className)}
            style={{ background: orb.background }}
            animate={breathe ? orb.path : { x: 0, y: 0, scale: 1 }}
            transition={
              breathe
                ? { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
            }
            data-slot="loading-ambient-orb"
          />
        ))}
      </div>

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
