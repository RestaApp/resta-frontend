import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Boxes } from 'lucide-react'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { useLabels } from '@/shared/i18n/hooks'

type ProfileSupplierCategorySectionProps = {
  category: string | null
}

export const ProfileSupplierCategorySection = memo(
  ({ category }: ProfileSupplierCategorySectionProps) => {
    const { t } = useTranslation()
    const { getSupplierTypeLabel } = useLabels()
    if (!category) return null

    return (
      <div className="ui-density-stack">
        <h3 className={cn(BLOCK_TITLE_CLASS, 'flex items-center gap-2')}>
          <Boxes className="h-5 w-5 stroke-[1.5] text-primary" />
          {t('profile.supplierCategorySection', { defaultValue: 'Категория поставщика' })}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="tag" className="font-normal">
            {getSupplierTypeLabel(category)}
          </Badge>
        </div>
      </div>
    )
  }
)

ProfileSupplierCategorySection.displayName = 'ProfileSupplierCategorySection'
