/**
 * Поле выбора города с автодополнением
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { useLocationField } from '../../../../model/useLocationField'
import { AnimatedField } from './AnimatedField'
interface LocationFieldProps {
  value: string
  onChange: (value: string) => void
  onLocationRequest: () => void
  showLocationButton?: boolean
  withAnimation?: boolean
  animationDelay?: number
  isLoading?: boolean
  /** Очищать поле при фокусе (например, в фильтрах) */
  clearOnFocus?: boolean
  /** Не показывать подпись (заголовок задаётся снаружи, напр. в фильтрах) */
  hideLabel?: boolean
}

export const LocationField = memo(function LocationField({
  value,
  onChange,
  onLocationRequest,
  showLocationButton = true,
  withAnimation = false,
  animationDelay = 0,
  isLoading = false,
  clearOnFocus = false,
  hideLabel = false,
}: LocationFieldProps) {
  const { t } = useTranslation()
  const {
    isValid,
    errorMessage,
    isLoadingCities,
    hasSuggestions,
    hasMore,
    filteredCities,
    inputRef,
    containerRef,
    listRef,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleCitySelect,
  } = useLocationField({
    value,
    onChange,
  })

  const content = (
    <div ref={containerRef} className="relative">
      <FormField
        label={hideLabel ? undefined : t('profile.city')}
        error={!isValid ? (errorMessage ?? undefined) : undefined}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              if (clearOnFocus && value) {
                onChange('')
              }
              handleInputFocus()
            }}
            onBlur={handleInputBlur}
            placeholder={t('citySelect.placeholder')}
            className="pr-12"
            autoComplete="off"
            aria-invalid={!isValid}
          />
          {showLocationButton ? (
            <button
              onClick={onLocationRequest}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('aria.determineLocation')}
              type="button"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <MapPin className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : null}
        </div>
      </FormField>

      {/* Выпадающий список с городами */}
      <AnimatePresence>
        {hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: Z_INDEX.popover }}
            className="absolute w-full mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
          >
            {isLoadingCities ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3">
                <Loader size="sm" />
              </div>
            ) : (
              <div
                ref={listRef}
                className="max-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain"
              >
                <ul className="py-1">
                  {filteredCities.map((city: string) => (
                    <li key={city}>
                      <button
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors focus:outline-none focus:bg-secondary/50"
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
                {hasMore ? (
                  <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
                    {t('citySelect.loadMoreHint')}
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
      {content}
    </AnimatedField>
  )
})
