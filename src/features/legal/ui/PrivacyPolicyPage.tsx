import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'
import { resetAppScroll } from '@/shared/ui/appScroll'

interface PrivacyPolicyPageProps {
  onBack: () => void
}

export const PrivacyPolicyPage = memo(function PrivacyPolicyPage({
  onBack,
}: PrivacyPolicyPageProps) {
  const { t } = useTranslation()

  useEffect(() => {
    resetAppScroll()
  }, [])

  return (
    <div className="flex flex-col bg-background">
      <PageHeader
        title={t('legal.privacyPolicy')}
        leadingAction="back"
        onLeadingAction={onBack}
        leadingAriaLabel={t('common.back')}
      />
      <div className="ui-density-page pb-24 pt-3">
        <article className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.generalTitle')}</h2>
            <p>{t('legal.privacy.generalText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.operatorTitle')}</h2>
            <p>{t('legal.privacy.operatorText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.dataTitle')}</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {(t('legal.privacy.dataList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.purposeTitle')}</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {(t('legal.privacy.purposeList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.basisTitle')}</h2>
            <p>{t('legal.privacy.basisText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.storageTitle')}</h2>
            <p>{t('legal.privacy.storageText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.rightsTitle')}</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {(t('legal.privacy.rightsList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.thirdPartyTitle')}</h2>
            <p>{t('legal.privacy.thirdPartyText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.geolocationTitle')}</h2>
            <p>{t('legal.privacy.geolocationText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.privacy.contactTitle')}</h2>
            <p>{t('legal.privacy.contactText')}</p>
          </section>

          <p className="text-xs text-muted-foreground">{t('legal.privacy.lastUpdated')}</p>
        </article>
      </div>
    </div>
  )
})
