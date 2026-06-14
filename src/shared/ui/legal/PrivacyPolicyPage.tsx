import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'
import { BODY_TEXT_CLASS, SECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { cn } from '@/shared/utils/cn'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

interface PrivacyPolicyPageProps {
  onBack: () => void
}

export const PrivacyPolicyPage = memo(function PrivacyPolicyPage({
  onBack,
}: PrivacyPolicyPageProps) {
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
      <PageHeader title={t('legal.privacyPolicy')} />
      <div className="ui-density-page pb-24 pt-3">
        <article className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.generalTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.generalText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.operatorTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.operatorText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.dataTitle')}</h2>
            <ul className={cn(BODY_TEXT_CLASS, 'flex list-disc flex-col gap-1 pl-5')}>
              {(t('legal.privacy.dataList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.purposeTitle')}</h2>
            <ul className={cn(BODY_TEXT_CLASS, 'flex list-disc flex-col gap-1 pl-5')}>
              {(t('legal.privacy.purposeList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.basisTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.basisText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.storageTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.storageText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.rightsTitle')}</h2>
            <ul className={cn(BODY_TEXT_CLASS, 'flex list-disc flex-col gap-1 pl-5')}>
              {(t('legal.privacy.rightsList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.thirdPartyTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.thirdPartyText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.geolocationTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.geolocationText')}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{t('legal.privacy.contactTitle')}</h2>
            <p className={BODY_TEXT_CLASS}>{t('legal.privacy.contactText')}</p>
          </section>

          <p className="text-xs text-muted-foreground">{t('legal.privacy.lastUpdated')}</p>
        </article>
      </div>
    </div>
  )
})
