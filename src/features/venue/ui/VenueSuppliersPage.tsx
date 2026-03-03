import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'

type SupplierStatus = 'active' | 'paused'

interface SupplierItem {
  id: number
  name: string
  category: string
  status: SupplierStatus
  phone: string
}

const SUPPLIERS: SupplierItem[] = [
  { id: 1, name: 'FreshFood Group', category: 'Овощи и фрукты', status: 'active', phone: '+7 900 123-45-67' },
  { id: 2, name: 'Milk & Co', category: 'Молочная продукция', status: 'active', phone: '+7 900 222-33-44' },
  { id: 3, name: 'MeatPro', category: 'Мясо и птица', status: 'paused', phone: '+7 900 555-12-34' },
]

export function VenueSuppliersPage() {
  const { t } = useTranslation()
  const [onlyActive, setOnlyActive] = useState(false)

  const list = useMemo(() => {
    if (!onlyActive) return SUPPLIERS
    return SUPPLIERS.filter(item => item.status === 'active')
  }, [onlyActive])

  if (list.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          message={t('venueUi.suppliers.emptyTitle', { defaultValue: 'Поставщики не найдены' })}
          description={t('venueUi.suppliers.emptyDescription', {
            defaultValue: 'Отключите фильтр или добавьте нового поставщика',
          })}
          illustration={<EmptyInboxIllustration className="h-24 w-24" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('venueUi.suppliers.total', { defaultValue: 'Всего поставщиков' })}: {list.length}
        </p>
        <Button size="sm" variant={onlyActive ? 'primary' : 'outline'} onClick={() => setOnlyActive(v => !v)}>
          {onlyActive
            ? t('venueUi.suppliers.showAll', { defaultValue: 'Показать всех' })
            : t('venueUi.suppliers.showActive', { defaultValue: 'Только активные' })}
        </Button>
      </div>

      <div className="space-y-3">
        {list.map(item => (
          <Card key={item.id} className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-medium text-foreground">{item.name}</p>
              <Badge variant={item.status === 'active' ? 'primary' : 'secondary'}>
                {item.status === 'active'
                  ? t('venueUi.suppliers.status.active', { defaultValue: 'Активен' })
                  : t('venueUi.suppliers.status.paused', { defaultValue: 'Пауза' })}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.category}</p>
            <p className="text-sm text-muted-foreground">{item.phone}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
