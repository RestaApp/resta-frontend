import { useTranslation } from 'react-i18next'
import { KpiRow, type KpiItem } from '@/components/ui/kpi-row'

interface ProfileKpiCardProps {
  /** Закрытые смены — есть на бэке (см. shift.status === 'completed'). */
  completedShifts: number
  /**
   * Заработано BYN. Бэк не агрегирует выплаты — приходит null до интеграции.
   * См. HANDOFF.md → «GET /me/earnings_total».
   */
  earnedTotal?: number | null
  /**
   * Средний рейтинг по отзывам. Бэк не возвращает.
   * См. HANDOFF.md → «GET /me/rating».
   */
  rating?: number | null
}

/**
 * KPI-карточка профиля сотрудника (см. E10 Resta Wireframes).
 *
 * SRP: только маппинг данных профиля в `KpiRow`. Логику расчёта/загрузки
 * держим в хуках профиля (`useProfilePageModel`).
 *
 * Часть значений (rating / earnedTotal) пока недоступны на бэке — при отсутствии
 * показываем «—» и помечаем как `muted`. Когда эндпоинты поедут, пропсы
 * заполнятся реальными значениями без правок UI.
 */
export const ProfileKpiCard = ({ completedShifts, earnedTotal, rating }: ProfileKpiCardProps) => {
  const { t } = useTranslation()

  const items: KpiItem[] = [
    {
      id: 'shifts',
      value: completedShifts,
      label: t('profile.kpi.shifts', 'Смен'),
    },
    {
      id: 'earned',
      value: earnedTotal != null ? earnedTotal.toLocaleString('ru-RU') : '—',
      label: 'BYN',
      tone: earnedTotal != null ? 'default' : 'muted',
    },
    {
      id: 'rating',
      value: rating != null ? rating.toFixed(1) : '—',
      label: t('profile.kpi.rating', 'Рейтинг'),
      tone: rating != null ? 'success' : 'muted',
    },
  ]

  return <KpiRow items={items} />
}
