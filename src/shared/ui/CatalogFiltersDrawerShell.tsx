import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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
        <DrawerHeader>
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerCloseButton
              onClick={() => onOpenChange(false)}
              ariaLabel={t('common.close', { defaultValue: 'Закрыть' })}
            />
          </div>
        </DrawerHeader>

        <DrawerBody className={bodyClassName}>{children}</DrawerBody>

        <DrawerFooter className="gap-2">
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
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
}
