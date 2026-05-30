import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'

interface TermsOfServicePageProps {
  onBack: () => void
}

export const TermsOfServicePage = memo(function TermsOfServicePage({
  onBack,
}: TermsOfServicePageProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col bg-background">
      <PageHeader
        title={t('legal.termsOfService')}
        leadingAction="back"
        onLeadingAction={onBack}
        leadingAriaLabel={t('common.back')}
      />
      <div className="ui-density-page pb-24 pt-3">
        <article className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.generalTitle')}</h2>
            <p>{t('legal.terms.generalText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.subjectTitle')}</h2>
            <p>{t('legal.terms.subjectText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.platformTitle')}</h2>
            <p>{t('legal.terms.platformText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.userTitle')}</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {(t('legal.terms.userList', { returnObjects: true }) as string[]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.paymentTitle')}</h2>
            <p>{t('legal.terms.paymentText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.subscriptionTitle')}</h2>
            <p>{t('legal.terms.subscriptionText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.reviewsTitle')}</h2>
            <p>{t('legal.terms.reviewsText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.liabilityTitle')}</h2>
            <p>{t('legal.terms.liabilityText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.terminationTitle')}</h2>
            <p>{t('legal.terms.terminationText')}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">{t('legal.terms.lawTitle')}</h2>
            <p>{t('legal.terms.lawText')}</p>
          </section>

          <p className="text-xs text-muted-foreground">{t('legal.terms.lastUpdated')}</p>
        </article>
      </div>
    </div>
  )
})
