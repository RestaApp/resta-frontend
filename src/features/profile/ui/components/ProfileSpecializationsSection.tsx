import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { CookingPot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLabels } from '@/shared/i18n/hooks'

type ProfileSpecializationsSectionProps = {
  specializations: string[]
}

export const ProfileSpecializationsSection = memo(
  ({ specializations }: ProfileSpecializationsSectionProps) => {
    const { t } = useTranslation()
    const { getSpecializationLabel } = useLabels()
    if (specializations.length === 0) return null

    return (
      <div>
        <h3 className="text-lg font-semibold ui-density-mb flex items-center gap-2">
          <CookingPot className="h-5 w-5 stroke-[1.5]" style={{ color: 'var(--purple-deep)' }} />
          {t('profile.specializationSection')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {specializations.map(spec => (
            <Badge key={spec} variant="tag" className="font-normal">
              {getSpecializationLabel(spec)}
            </Badge>
          ))}
        </div>
      </div>
    )
  }
)

ProfileSpecializationsSection.displayName = 'ProfileSpecializationsSection'
