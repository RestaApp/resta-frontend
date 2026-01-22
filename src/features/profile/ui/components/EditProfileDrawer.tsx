import { memo } from 'react'
import { Drawer, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { RangeSlider } from '@/components/ui'
import { formatExperienceText } from '@/utils/experience'
import { ChevronDown } from 'lucide-react'
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
            <div className="text-sm text-muted-foreground py-2">Загрузка городов...</div>
          ) : (
            <div className="relative">
              <select
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                disabled={isLoading}
                className="w-full h-11 rounded-xl border border-border/50 px-4 pr-10 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 appearance-none"
              >
                <option value="">Выберите город</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
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
    </Drawer>
  )
})
EditProfileDrawer.displayName = 'EditProfileDrawer'
