import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { Drawer, DrawerCloseButton } from '@/components/ui/drawer'
import { RangeSlider, DatePicker } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { useAdvancedFilters } from '../../model/hooks/useAdvancedFilters'
import { DEFAULT_PRICE_RANGE, DEFAULT_JOBS_PRICE_RANGE } from '@/utils/filters'

export interface AdvancedFiltersData {
  priceRange: [number, number] | null
  selectedPosition?: string | null
  selectedSpecializations?: string[]
  startDate?: string | null // YYYY-MM-DD
  endDate?: string | null // YYYY-MM-DD
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: AdvancedFiltersData | null) => void
  initialFilters?: AdvancedFiltersData
  filteredCount?: number
  searchQuery?: string
  activeFilter?: string
  isVacancy?: boolean // Флаг для вакансий (скрыть период, изменить текст)
}

export const AdvancedFilters = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  filteredCount,
  isVacancy = false,
}: AdvancedFiltersProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AdvancedFiltersSheet
        onClose={onClose}
        onApply={onApply}
        initialFilters={initialFilters}
        filteredCount={filteredCount}
        isVacancy={isVacancy}
      />
    </Drawer>
  )
}

const AdvancedFiltersSheet = ({
  onClose,
  onApply,
  initialFilters,
  filteredCount,
  isVacancy,
}: Omit<AdvancedFiltersProps, 'isOpen'>) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const {
    priceRange,
    selectedPosition,
    selectedSpecializations,
    startDate,
    endDate,
    setPriceRange,
    setStartDate,
    setEndDate,
    handlePositionSelect,
    toggleSpecialization,
    handleReset,
    handleApply,
    hasActiveFilters,
  } = useAdvancedFilters({
    initialFilters: initialFilters || null,
    onApply,
  })

  // Дефолтный диапазон для отображения (не применяется автоматически)
  const displayPriceRange = useMemo(() => {
    return priceRange || (isVacancy ? DEFAULT_JOBS_PRICE_RANGE : DEFAULT_PRICE_RANGE)
  }, [priceRange, isVacancy])

  // Предыдущие специализации (показываем во время загрузки при смене позиции)
  const [previousSpecializations, setPreviousSpecializations] = useState<string[]>([])

  // Получаем минимальную дату для начальной даты (сегодня)
  const formatLocalDateKey = useCallback((date: Date): string => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const getMinStartDate = useCallback((): string => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return formatLocalDateKey(today)
  }, [formatLocalDateKey])

  // Получаем минимальную дату для конечной даты (сегодня или startDate)
  const getMinEndDate = useCallback((): string => {
    if (startDate) {
      return startDate
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return formatLocalDateKey(today)
  }, [startDate, formatLocalDateKey])

  // Загружаем позиции (хук сам использует Redux кеш и сохраняет данные)
  const { positions: positionsForDisplay } = useUserPositions({ enabled: true })

  // Загружаем специализации при выборе позиции (хук сам использует Redux кеш и сохраняет данные)
  const {
    specializations: availableSpecializations,
    isLoading: isLoadingSpecializations,
    isFetching: isFetchingSpecializations,
  } = useUserSpecializations({
    position: selectedPosition,
    enabled: !!selectedPosition,
  })

  const handlePositionClick = useCallback(
    (positionValue: string) => {
      const isChanging = selectedPosition !== positionValue
      if (isChanging && availableSpecializations.length > 0) {
        setPreviousSpecializations(availableSpecializations)
      }
      if (!isChanging) {
        setPreviousSpecializations([])
      }
      handlePositionSelect(positionValue)
    },
    [availableSpecializations, handlePositionSelect, selectedPosition]
  )

  // Определяем, какие специализации показывать (предыдущие во время загрузки или новые)
  const isLoading = isLoadingSpecializations || isFetchingSpecializations
  const shouldShowPrevious = isLoading && previousSpecializations.length > 0
  const displaySpecializations = shouldShowPrevious
    ? previousSpecializations
    : availableSpecializations
  const isSpecializationsLoading = shouldShowPrevious

  // Используем filteredCount из пропсов (из основного запроса в FeedPage)
  const previewCount = filteredCount ?? 0

  const handleRangeChange = useCallback(
    (range: [number, number]) => {
      setPriceRange(range)
    },
    [setPriceRange]
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-5 flex items-center justify-between border-b border-border/50 flex-shrink-0 bg-background sticky top-0 z-10">
          <h2 className="text-xl font-bold">{t('feed.filters')}</h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                onClick={handleReset}
                variant="secondary"
                size="sm"
                aria-label={t('feed.resetFiltersAria')}
                className="rounded-full px-3 py-1.5"
              >
                {t('common.reset')}
              </Button>
            )}
            <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} className="-mr-2" />
          </div>
      </div>

      <motion.div
        layout
        transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
        className="p-5 space-y-8 pb-4 overflow-y-auto flex-1 min-h-0"
      >
          {/* 1. Бюджет (Range Slider) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base">
                {isVacancy ? t('feed.ratePerVacancy') : t('feed.ratePerShift')}
              </h3>
              <span className="text-primary font-bold text-sm">
                {displayPriceRange[0]} - {displayPriceRange[1]} BYN
              </span>
            </div>
            <RangeSlider
              min={0}
              max={isVacancy ? 5000 : 1000}
              step={isVacancy ? 50 : 10}
              range={displayPriceRange}
              onRangeChange={handleRangeChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 BYN</span>
              <span>{isVacancy ? '5000+' : '1000+'} BYN</span>
            </div>
          </div>

          {/* 2. Даты (только для смен, не для вакансий) */}
          {!isVacancy && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base">{t('feed.period')}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    minDate={getMinStartDate()}
                    label={t('common.from')}
                  />
                </div>
                <div className="min-w-0">
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    minDate={getMinEndDate()}
                    label={t('common.to')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Позиция */}
          {positionsForDisplay.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base">{t('common.position')}</h3>
              <div className="flex flex-wrap gap-2">
                {positionsForDisplay.map(
                  (position: { id: string; originalValue?: string; title: string }) => {
                    const positionValue = position.originalValue || position.id
                    return (
                      <SelectableTagButton
                        key={positionValue}
                        value={positionValue}
                        label={position.title}
                        isSelected={selectedPosition === positionValue}
                        onClick={() => handlePositionClick(positionValue)}
                        ariaLabel={t('aria.selectPosition', { label: position.title })}
                      />
                    )
                  }
                )}
              </div>
            </div>
          )}

          {/* 4. Специализация (показываем только если выбрана позиция) */}
          <AnimatePresence initial={false}>
            {selectedPosition &&
              (displaySpecializations.length > 0 || isSpecializationsLoading) && (
                <motion.div
                  key={`specializations-${selectedPosition}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  layout
                  className="space-y-3 overflow-hidden relative"
                >
                  <h3 className="font-semibold text-base">{t('shift.specialization')}</h3>
                  <div className="flex flex-wrap gap-2 relative">
                    {/* Индикатор загрузки на фоне */}
                    {isSpecializationsLoading && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}

                    {displaySpecializations.map(specialization => (
                      <SelectableTagButton
                        key={specialization}
                        value={specialization}
                        label={getSpecializationLabel(specialization)}
                        isSelected={selectedSpecializations.includes(specialization)}
                        onClick={() => toggleSpecialization(specialization)}
                        ariaLabel={t('aria.selectSpecialization', {
                          label: getSpecializationLabel(specialization),
                        })}
                        disabled={isSpecializationsLoading}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
      </motion.div>

      <div className="px-5 py-4 border-t border-border/50 bg-background flex-shrink-0">
        <Button
          type="button"
          onClick={() => {
            handleApply()
            onClose()
          }}
          variant="gradient"
          size="md"
          className="w-full"
        >
          {isVacancy
            ? t('feed.showVacanciesCount', { count: previewCount })
            : t('feed.showShiftsCount', { count: previewCount })}
        </Button>
      </div>
    </div>
  )
}
