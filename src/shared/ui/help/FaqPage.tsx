import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/card'
import { SECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import { HelpTopicContent } from '@/components/ui/help-hint/HelpTopicContent'
import type { HelpTopic } from '@/shared/help/helpTopics'

/** Порядок тем на экране FAQ. */
const FAQ_TOPICS: HelpTopic[] = ['urgent', 'pro', 'limits', 'accept', 'priceList', 'analytics']

/** Экран FAQ: все темы справки одним списком. Тот же контент, что и «?»-хинты. */
export const FaqPage = memo(function FaqPage({ onBack }: { onBack: () => void }) {
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
      <PageHeader title={t('faq.title')} />
      <div className="ui-density-page ui-density-stack pt-3">
        {FAQ_TOPICS.map(topic => (
          <Card key={topic} className="flex flex-col gap-3">
            <h2 className={SECTION_TITLE_CLASS}>{t(`help.${topic}.title`)}</h2>
            <HelpTopicContent topic={topic} />
          </Card>
        ))}
      </div>
    </div>
  )
})
