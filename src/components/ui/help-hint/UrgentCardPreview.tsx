import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import {
  SHIFT_CARD_BADGE_CLASS,
  SHIFT_CARD_CLASS,
  SHIFT_CARD_ROW_CLASS,
  SHIFT_CARD_SOS_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

/** Демо-карточка срочной смены для хинта: показывает SOS-бейдж и выделение. */
export const UrgentCardPreview = memo(function UrgentCardPreview() {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        SHIFT_CARD_CLASS,
        SHIFT_CARD_SOS_CLASS,
        'pointer-events-none flex flex-col gap-1.5'
      )}
    >
      <span className={cn(SHIFT_CARD_BADGE_CLASS, 'inline-flex w-fit items-center gap-1')}>
        <Flame className={ICON_SM_CLASS} aria-hidden />
        SOS
      </span>
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="min-w-0">
          <p className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>{t('help.urgent.previewTitle')}</p>
          <p className={SHIFT_CARD_SUB_CLASS}>{t('help.urgent.previewSubtitle')}</p>
        </div>
        <span className="shrink-0 text-sm font-bold text-foreground">
          1 234 <span className="text-xs font-semibold text-muted-foreground">BYN</span>
        </span>
      </div>
    </div>
  )
})
