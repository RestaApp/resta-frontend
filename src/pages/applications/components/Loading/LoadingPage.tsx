import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ChefHat } from 'lucide-react'
import { LogoWithText } from '@/components/ui/logo-with-text'

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const displayedProgress = reduceMotion ? 100 : progress

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return 98
        if (prev < 80) return Math.min(prev + 2, 80)
        if (prev < 92) return Math.min(prev + 0.6, 92)
        return Math.min(prev + 0.15, 98)
      })
    }, 60)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

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

      <motion.div
        animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'linear' }
        }
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--purple-deep)" />
              <stop offset="50%" stopColor="var(--pink-electric)" />
              <stop offset="100%" stopColor="var(--blue-cyber)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#loading-gradient)"
            strokeWidth="2"
            strokeDasharray="10 5"
            opacity="0.6"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }
        }
        className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: '0 20px 60px rgba(107, 33, 168, 0.4)',
        }}
      >
        <motion.div
          animate={reduceMotion ? { y: 0 } : { y: [0, -5, 0] }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <ChefHat className="h-16 w-16 text-white" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
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
            background: 'linear-gradient(135deg, var(--blue-cyber) 0%, var(--pink-electric) 100%)',
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
          titleClassName="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent"
        />

        <div className="w-64">
          <div
            className="relative h-1.5 overflow-hidden rounded-full border backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'var(--border)',
            }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
              initial={reduceMotion ? false : { width: '0%' }}
              animate={{ width: `${displayedProgress}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
            />

            <motion.div
              className="absolute inset-y-0 left-0 w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
              }}
              animate={
                reduceMotion
                  ? { transform: 'translateX(-100%)' }
                  : { transform: 'translateX(200%)' }
              }
              transition={
                reduceMotion ? { duration: 0 } : { duration: 1.5, repeat: Infinity, ease: 'linear' }
              }
              aria-hidden="true"
            />
          </div>

          <motion.p
            className="mt-3 text-center text-xs text-muted-foreground"
            animate={reduceMotion ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            {t('common.loading')}...
          </motion.p>
        </div>

        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={
                reduceMotion
                  ? { opacity: 0.6, scale: 1 }
                  : { opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }
              }
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--pink-electric)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
})
