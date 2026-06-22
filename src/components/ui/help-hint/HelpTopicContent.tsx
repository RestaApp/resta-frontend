import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, TrendingUp } from 'lucide-react'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import { HELP_TOPICS, type HelpTopic } from '@/shared/help/helpTopics'
import { UrgentCardPreview } from './UrgentCardPreview'

/** Контент темы справки: текст + (опц.) превью, хайлайт и платный блок. */
export const HelpTopicContent = memo(function HelpTopicContent({ topic }: { topic: HelpTopic }) {
  const { t } = useTranslation()
  const config = HELP_TOPICS[topic]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">{t(`help.${topic}.body`)}</p>

      {config.preview === 'urgentCard' ? <UrgentCardPreview /> : null}

      {config.highlight ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t(`help.${topic}.highlight`)}
        </div>
      ) : null}

      {config.paid && MONETIZATION_ENABLED ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {t(`help.${topic}.paid`)}
        </div>
      ) : null}
    </div>
  )
})
