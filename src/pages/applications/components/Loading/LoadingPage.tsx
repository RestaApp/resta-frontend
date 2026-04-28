import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { LogoWithText } from '@/components/ui/logo-with-text'

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()


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
        className="absolute inset-0 -z-10 blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />




      <div className="relative mb-8 h-[88px] w-[88px]">
        <motion.div
          className="absolute inset-0 grid place-items-center rounded-3xl text-[52px] font-extrabold text-white"
          style={{
            boxShadow: '0 24px 48px color-mix(in srgb, var(--terracotta) 40%, transparent)',
            background: 'linear-gradient(135deg, var(--terracotta), #ff8a5c)',
          }}
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
            borderColor: 'var(--terracotta)',
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
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
          className="absolute -left-1/2 -top-1/2 h-full w-full blur-3xl"
          style={{ background: 'var(--gradient-primary)' }}
          aria-hidden="true"
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
          className="absolute -bottom-1/2 -right-1/2 h-full w-full blur-3xl"
          style={{
            background: 'linear-gradient(135deg, var(--amber) 0%, var(--terracotta) 100%)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-8">
        <LogoWithText
          icon={logoIcon}
          title="Resta"
          subtitle={t('loadingPage.subtitle')}
          iconClassName="mb-0"
          titleClassName="font-display text-5xl tracking-tight bg-[image:var(--gradient-primary)] bg-clip-text text-transparent"
        />




      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-7 text-center">
        <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground/70">
          {t('loadingPage.country')}
        </p>
      </div>
    </div>
  )
})
