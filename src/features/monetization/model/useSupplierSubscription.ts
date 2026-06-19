import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/store/slices/userSlice'
import { mapRoleFromApi } from '@/shared/utils/roles'
import { useGetCurrentSubscriptionQuery } from '@/services/api/subscriptionsApi'

const ACTIVE_STATUSES = new Set(['active', 'trial', 'renewed'])

/**
 * Текущий план/подписка поставщика. Запрос только для роли supplier
 * (для прочих ролей usage берётся отдельным хуком). Кэш RTK Query общий.
 */
export const useSupplierSubscription = () => {
  const userData = useAppSelector(selectUserData)
  const isSupplier = userData?.role ? mapRoleFromApi(userData.role) === 'supplier' : false

  const { data, isLoading, refetch } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !isSupplier,
  })

  const plan = data?.data.plan ?? null
  const subscription = data?.data.subscription ?? null
  const isPro = subscription ? ACTIVE_STATUSES.has(subscription.status) : false

  return { isSupplier, plan, subscription, isPro, isLoading, refetch }
}
