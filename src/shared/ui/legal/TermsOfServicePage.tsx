import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'
import { BODY_TEXT_CLASS, SECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { cn } from '@/shared/utils/cn'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

interface TermsOfServicePageProps {
  onBack: () => void
}

export const TermsOfServicePage = memo(function TermsOfServicePage({
  onBack,
}: TermsOfServicePageProps) {
  const { t } = useTranslation()

  const onBackRef = useRef(onBack)
  useLayoutEffect(() => {
    onBackRef.current = onBack
  })
  const stableBack = useCallback(() => onBackRef.current(), [])

  useEffect(() => {
    resetAppScroll()
  }, [])

  useEffect(() => {
    return setupTelegramBackButton(stableBack)
  }, [stableBack])

  return (
    <div className="flex flex-col bg-background">
      <PageHeader title={t('legal.termsOfService')} />
      <div className="ui-density-page pt-3">
        <article className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.generalTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.generalText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.subjectTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.subjectText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.platformTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.platformText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.userTitle')}</h2>
            <ul className={cn(BODY_TEXT_CLASS, 'flex list-disc flex-col gap-1 pl-5')}>
              {(t('legal.terms.userList', { returnObjects: true }) as string[]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.paymentTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.paymentText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.subscriptionTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.subscriptionText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.reviewsTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.reviewsText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.liabilityTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.liabilityText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.terminationTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.terminationText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.terms.lawTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.terms.lawText')}</p>
          </section>

          <p className="text-xs text-muted-foreground">{t('legal.terms.lastUpdated')}</p>
        </article>
      </div>
    </div>
  )
})
