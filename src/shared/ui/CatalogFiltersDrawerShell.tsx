import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'

interface CatalogFiltersDrawerShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  applyLabel: string
  onApply: () => void
  onReset: () => void
  children: ReactNode
  frameClassName?: string
  bodyClassName?: string
  applyVariant?: 'primary' | 'gradient'
}

export const CatalogFiltersDrawerShell = ({
  open,
  onOpenChange,
  title,
  applyLabel,
  onApply,
  onReset,
  children,
  frameClassName,
  bodyClassName = 'ui-density-stack',
  applyVariant = 'gradient',
}: CatalogFiltersDrawerShellProps) => {
  const { t } = useTranslation()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame className={frameClassName}>
        <DrawerTitleBar title={title} onClose={() => onOpenChange(false)} />

        <DrawerBody className={bodyClassName}>{children}</DrawerBody>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="md" className="flex-1" onClick={onReset}>
              {t('common.reset', { defaultValue: 'Сбросить' })}
            </Button>
            <Button
              type="button"
              variant={applyVariant}
              size="md"
              className="flex-1"
              onClick={onApply}
            >
              {applyLabel}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
}
