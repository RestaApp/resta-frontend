import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { DETAIL_CARD_CLASS, ICON_WRAPPER_SECTION } from './constants'

interface TextCardProps {
  icon: LucideIcon
  title: string
  content: string
}

export const TextCard = memo(({ icon: Icon, title, content }: TextCardProps) => (
  <Card className={DETAIL_CARD_CLASS}>
    <div className="flex items-center gap-2 mb-2">
      <div className={cn(ICON_WRAPPER_SECTION)} aria-hidden>
        <Icon className="h-5 w-5 text-primary shrink-0" />
      </div>
      <h2 className="text-base font-medium text-foreground break-words">{title}</h2>
    </div>
    <div
      className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words"
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    >
      {content}
    </div>
  </Card>
))

TextCard.displayName = 'TextCard'
