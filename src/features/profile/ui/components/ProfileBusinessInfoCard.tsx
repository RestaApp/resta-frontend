import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

type ProfileBusinessInfoCardProps = {
  kind: 'restaurant' | 'supplier'
  value: string | null
  variant?: 'card' | 'section'
}

const TITLE_BY_KIND = {
  restaurant: 'roles.venueInfoTitle',
  supplier: 'roles.supplierInfoTitle',
} as const

const LABEL_BY_KIND = {
  restaurant: 'profile.venueType',
  supplier: 'profile.companyName',
} as const

export const ProfileBusinessInfoCard = memo(
  ({ kind, value, variant = 'card' }: ProfileBusinessInfoCardProps) => {
    const { t } = useTranslation()
    if (!value) return null

    const content = (
      <>
        <h4 className="font-semibold ui-density-mb">{t(TITLE_BY_KIND[kind])}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t(LABEL_BY_KIND[kind])}</span>
            <span className="text-right">{value}</span>
          </div>
        </div>
      </>
    )

    if (variant === 'section') return <div className="py-2">{content}</div>

    return <Card className="p-4">{content}</Card>
  }
)

ProfileBusinessInfoCard.displayName = 'ProfileBusinessInfoCard'
