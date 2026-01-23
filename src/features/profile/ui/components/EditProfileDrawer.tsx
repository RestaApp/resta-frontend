import { memo } from 'react'
import { Drawer, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { RangeSlider } from '@/components/ui'
import { CitySelect } from '@/components/ui/city-select'
import { Loader } from '@/components/ui/loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatExperienceText } from '@/utils/experience'
import { useEditProfileModel } from '../../model/hooks/useEditProfileModel'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const EditProfileDrawer = memo(({ open, onOpenChange, onSuccess }: EditProfileDrawerProps) => {
  const {
    userProfile,
    apiRole,
    formData,
    cities,
    isCitiesLoading,
    isLoading,
    handleSave,
    updateField,
    showCityWarning,
    setShowCityWarning,
    handleSaveWithoutCity,
  } = useEditProfileModel(open, onSuccess)

  if (!userProfile) {
    return null
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} bottomOffsetPx={76}>
      <DrawerHeader>
        <DrawerTitle>Редактировать профиль</DrawerTitle>
        <DrawerDescription>Обновите информацию о себе</DrawerDescription>
      </DrawerHeader>

      <div className="px-4 space-y-4 pb-4">
        {/* Имя */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Имя {apiRole === 'restaurant' || apiRole === 'supplier' ? '/ Название' : ''} *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Введите имя"
            disabled={isLoading}
          />
        </div>

        {/* Фамилия (только для сотрудников) */}
        {apiRole === 'employee' && (
          <div>
            <label className="block text-sm font-medium mb-2">Фамилия</label>
            <Input
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Введите фамилию"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Описание{' '}
            {apiRole === 'restaurant' ? 'о заведении' : apiRole === 'supplier' ? 'о компании' : 'о себе'}
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder={`Введите описание ${apiRole === 'restaurant' ? 'о заведении' : apiRole === 'supplier' ? 'о компании' : 'о себе'}`}
            disabled={isLoading}
            rows={4}
            className="w-full min-h-[100px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Введите email"
            disabled={isLoading}
          />
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-sm font-medium mb-2">Телефон</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="Введите телефон"
            disabled={isLoading}
          />
        </div>

        {/* Опыт работы (для сотрудников) */}
        {apiRole === 'employee' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Опыт работы (лет)</label>
              <div className="mb-3">
                <span className="text-lg font-semibold text-gradient">
                  {formatExperienceText(typeof formData.experienceYears === 'number' ? formData.experienceYears : 0)}
                </span>
              </div>
              <RangeSlider
                min={0}
                max={5}
                step={1}
                value={typeof formData.experienceYears === 'number' ? formData.experienceYears : 0}
                onChange={(value) => updateField('experienceYears', value)}
                showTicks={true}
                tickCount={5}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
              <div>
                <label className="block text-sm font-medium mb-1">Открыт к работе</label>
                <p className="text-xs text-muted-foreground">Готов рассматривать предложения</p>
              </div>
              <Switch
                checked={formData.openToWork}
                onCheckedChange={(checked) => updateField('openToWork', checked)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Навыки</label>
              <Input
                value={formData.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                placeholder="Введите навыки через запятую"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">Например: работа с ножом, знание HACCP</p>
            </div>
          </>
        )}

        {/* Резюме/Опыт работы */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {apiRole === 'employee' ? 'Резюме' : 'Опыт работы'}
          </label>
          <textarea
            value={formData.workExperienceSummary}
            onChange={(e) => updateField('workExperienceSummary', e.target.value)}
            placeholder={apiRole === 'employee' ? 'Опишите свой опыт работы' : 'Опишите опыт работы'}
            disabled={isLoading}
            rows={4}
            className="w-full min-h-[100px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Город из справочника */}
        <div>
          <label className="block text-sm font-medium mb-2">Город</label>
          {isCitiesLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader size="sm" />
            </div>
          ) : (
            <CitySelect
              value={formData.city}
              onChange={(value) => updateField('city', value)}
              options={cities}
              placeholder="Выберите город"
              disabled={isLoading}
            />
          )}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSave} disabled={isLoading || !formData.name.trim()} className="w-full" variant="primary">
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button onClick={() => onOpenChange(false)} disabled={isLoading} variant="outline" className="w-full">
          Отмена
        </Button>
      </DrawerFooter>

      <AlertDialog open={showCityWarning} onOpenChange={setShowCityWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Город не указан</AlertDialogTitle>
            <AlertDialogDescription>
              Если не указать город, вы не сможете видеть релевантные вакансии и смены в вашем регионе. 
              Рекомендуем указать город для лучшего подбора предложений.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCityWarning(false)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveWithoutCity}>Сохранить без города</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  )
})
EditProfileDrawer.displayName = 'EditProfileDrawer'
