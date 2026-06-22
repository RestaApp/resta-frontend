import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils/cn'
import { type HelpTopic } from '@/shared/help/helpTopics'
import { HelpTopicContent } from './HelpTopicContent'

interface HelpHintProps {
  topic: HelpTopic
  className?: string
  ariaLabel?: string
}

/**
 * Контекстная справка по «?»: иконка → драўер с объяснением фичи.
 * Контент — из i18n (`help.<topic>.*`). Платный блок (цена/«платно») виден
 * только при включённой монетизации; разъясняющий текст — всегда.
 */
export const HelpHint = memo(function HelpHint({ topic, className, ariaLabel }: HelpHintProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const title = t(`help.${topic}.title`)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? t('help.openAria', { topic: title })}
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
          className
        )}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerFrame>
          <DrawerTitleBar title={title} onClose={() => setOpen(false)} />

          <DrawerBody className="pb-4 pt-2">
            <HelpTopicContent topic={topic} />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="gradient" size="md" className="w-full" onClick={() => setOpen(false)}>
              {t('help.gotIt')}
            </Button>
          </DrawerFooter>
        </DrawerFrame>
      </Drawer>
    </>
  )
})
