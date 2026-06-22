import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/card'
import { SECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import { HelpTopicContent } from '@/components/ui/help-hint/HelpTopicContent'
import { HELP_TOPICS, type HelpTopic } from '@/shared/help/helpTopics'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/store/slices/userSlice'
import { getRoleCategory } from '@/shared/types/roles.types'
import { mapRoleFromApi } from '@/shared/utils/roles'

/** Порядок тем на экране FAQ. */
const FAQ_TOPICS: HelpTopic[] = ['urgent', 'pro', 'limits', 'accept', 'priceList', 'analytics']

/** Экран FAQ: темы справки текущей роли одним списком. Тот же контент, что и «?»-хинты. */
export const FaqPage = memo(function FaqPage({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const userData = useAppSelector(selectUserData)

  // Каждая роль видит только свои темы (поставщик — B2B-темы, employee/restaurant — про смены).
  const topics = useMemo(() => {
    const role = getRoleCategory(mapRoleFromApi(userData?.role))
    return FAQ_TOPICS.filter(topic => HELP_TOPICS[topic].roles.includes(role))
  }, [userData?.role])

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
        {topics.map(topic => (
          <Card key={topic} className="flex flex-col gap-3">
            <h2 className={SECTION_TITLE_CLASS}>{t(`help.${topic}.title`)}</h2>
            <HelpTopicContent topic={topic} />
          </Card>
        ))}
      </div>
    </div>
  )
})
