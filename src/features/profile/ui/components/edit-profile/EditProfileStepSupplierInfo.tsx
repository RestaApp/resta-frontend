import { memo, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { HelpHint } from '@/components/ui/help-hint'
import { Switch } from '@/components/ui/switch'
import { InlineAction } from '@/components/ui/inline-action'
import { DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import { useSupplierSubscription } from '@/features/monetization/model/useSupplierSubscription'
import { UpgradeProDrawer } from '@/features/monetization/ui/UpgradeProDrawer'
import { BusinessAddressesField } from '../business-fields/BusinessAddressesField'
import { BusinessHoursField } from '../business-fields/BusinessHoursField'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EditProfileStepAbout } from './EditProfileStepAbout'
import { SupplierTypesField } from './SupplierTypesField'

interface EditProfileStepSupplierInfoProps {
  formData: ProfileFormData
  bioSuffix: string
  isLoading: boolean
  supplierTypeOptions: string[]
  isSupplierTypesLoading: boolean
  supplierTypesRef?: RefObject<HTMLDivElement | null>
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/** Шаг 3 для поставщика: типы, адреса, сайт, описание и заметки по графику. */
export const EditProfileStepSupplierInfo = memo(function EditProfileStepSupplierInfo({
  formData,
  bioSuffix,
  isLoading,
  supplierTypeOptions,
  isSupplierTypesLoading,
  supplierTypesRef,
  updateField,
}: EditProfileStepSupplierInfoProps) {
  const { t } = useTranslation()
  const { plan } = useSupplierSubscription()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Прайс-лист — PRO-фича. Гейтим только при включённой монетизации и загруженном плане,
  // у которого фича выключена (бэк остаётся источником истины).
  const priceListLocked = MONETIZATION_ENABLED && plan != null && plan.features.price_list !== true

  return (
    <>
      <SupplierTypesField
        options={supplierTypeOptions}
        isLoading={isSupplierTypesLoading}
        selected={formData.supplierTypes}
        disabled={isLoading}
        containerRef={supplierTypesRef}
        onChange={next => updateField('supplierTypes', next)}
      />

      <div className={DRAWER_SETTING_ROW_CLASS}>
        <div className="min-w-0">
          <p className={SHIFT_CARD_TITLE_CLASS}>{t('profile.deliveryAvailable')}</p>
          <p className={SHIFT_CARD_SUB_CLASS}>{t('profile.deliveryAvailableHint')}</p>
        </div>
        <Switch
          checked={formData.deliveryAvailable}
          disabled={isLoading}
          ariaLabel={t('profile.deliveryAvailable')}
          onCheckedChange={next => updateField('deliveryAvailable', next)}
        />
      </div>

      <BusinessAddressesField
        value={formData.location}
        disabled={isLoading}
        isRestaurant={false}
        onChange={next => updateField('location', next)}
      />

      <FormField label={t('profile.venueWebsite')} hint={t('profile.venueWebsiteHint')}>
        <Input
          type="url"
          inputMode="url"
          autoComplete="url"
          value={formData.website}
          onChange={e => updateField('website', e.target.value)}
          placeholder={t('profile.form.websitePlaceholder')}
          disabled={isLoading}
        />
      </FormField>

      <FormField
        label={t('profile.priceListUrl')}
        hint={t('profile.priceListUrlHint')}
        labelAdornment={<HelpHint topic="priceList" />}
      >
        {priceListLocked ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t('monetization.pro.lockedHint')}</span>
            </span>
            <InlineAction onClick={() => setUpgradeOpen(true)}>
              {t('monetization.pro.upgradeTitle')}
            </InlineAction>
          </div>
        ) : (
          <Input
            type="url"
            inputMode="url"
            autoComplete="url"
            value={formData.priceListUrl}
            onChange={e => updateField('priceListUrl', e.target.value)}
            placeholder={t('profile.form.websitePlaceholder')}
            disabled={isLoading}
          />
        )}
      </FormField>

      {priceListLocked ? (
        <UpgradeProDrawer open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      ) : null}

      <EditProfileStepAbout
        formData={formData}
        bioSuffix={bioSuffix}
        isLoading={isLoading}
        updateField={updateField}
      />

      <BusinessHoursField
        value={formData.businessHours}
        disabled={isLoading}
        variant="notes"
        onChange={next => updateField('businessHours', next)}
      />
    </>
  )
})
