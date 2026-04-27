import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UiRole) => void
  /** Показать бейдж «Чаще всего выбирают» */
  showPopularBadge?: boolean
}

export const RoleCard = memo(function RoleCard({
  role,
  isSelected,
  index,
  onSelect,
  showPopularBadge = false,
}: RoleCardProps) {
  const { t } = useTranslation()
  const roleAudienceKey: Partial<Record<UiRole, string>> = {
    chef: 'roles.roleCards.chefAudience',
    venue: 'roles.roleCards.venueAudience',
    supplier: 'roles.roleCards.supplierAudience',
  }
  const audienceKey = roleAudienceKey[role.id]
  const audienceText = audienceKey ? t(audienceKey) : null
  const roleIndex = String(index + 1).padStart(2, '0')

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      aria-label={t('aria.selectRole', { label: role.title })}
      aria-pressed={isSelected}
      className={cn(
        'relative w-full rounded-[1.9rem] border bg-[#14110f] px-6 py-8 text-left transition-all',
        isSelected
          ? 'border-[#F05A28] shadow-[0_0_0_1px_rgba(240,90,40,0.4)]'
          : 'border-[#2A241F] hover:border-[#3A322C]'
      )}
    >
      {showPopularBadge ? (
        <span className="absolute -top-4 left-6 rounded-[1rem] bg-[#F05A28] px-4 py-2 text-[clamp(0.82rem,2.9vw,1.08rem)] font-semibold tracking-[0.2em] text-[#FFF3EA] uppercase leading-none">
          {t('roles.mostPopularBadge')}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[clamp(1.9rem,7.1vw,2.9rem)] leading-[1.05] font-semibold text-[#F2ECE4]">
            {role.title}
          </h3>
          <p className="mt-2 text-[clamp(1.4rem,5.2vw,2.1rem)] leading-[1.2] text-[#877F77]">
            {role.description}
          </p>
          <div className="mt-6 h-px w-full border-t border-dashed border-[#332E2A]" aria-hidden />
          {audienceText ? (
            <p className="mt-6 text-[clamp(1.3rem,4.8vw,2rem)] font-semibold tracking-[0.02em] text-[#DB582B]">
              {'\u2022'} {audienceText}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 pt-1 text-[clamp(1.6rem,5.8vw,2.7rem)] leading-none font-medium tracking-[0.08em] text-[#4C453F]">
          {roleIndex}
        </span>
      </div>
    </button>
  )
})
