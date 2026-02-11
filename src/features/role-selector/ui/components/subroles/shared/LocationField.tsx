/**
 * Поле выбора города с автодополнением
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { useLocationField } from '../../../../model/useLocationField'
import { AnimatedField } from './AnimatedField'

interface LocationFieldProps {
  value: string
  onChange: (value: string) => void
  onLocationRequest: () => void
  withAnimation?: boolean
  animationDelay?: number
  isLoading?: boolean
}

export const LocationField = memo(function LocationField({
  value,
  onChange,
  onLocationRequest,
  withAnimation = false,
  animationDelay = 0,
  isLoading = false,
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
      <label className="block mb-2 text-muted-foreground text-sm font-medium">
        {t('profile.city')}
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={t('citySelect.placeholderExample')}
          className="pr-12"
          autoComplete="off"
          aria-invalid={!isValid}
        />
        <button
          onClick={onLocationRequest}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('aria.determineLocation')}
          type="button"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Выпадающий список с городами */}
      <AnimatePresence>
        {hasSuggestions && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-[200px] overflow-y-auto"
          >
            {isLoadingCities ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3">
                <Loader size="sm" />
              </div>
            ) : (
              <>
                <ul className="py-1">
                  {filteredCities.map((city: string) => (
                    <li key={city}>
                      <button
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:bg-muted/50"
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
                {hasMore && (
                  <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border">
                    {t('citySelect.loadMoreHint')}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сообщение об ошибке */}
      {!isValid && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-1 text-xs text-red-500"
        >
          {errorMessage}
        </motion.div>
      )}
    </div>
  )

  return (
    <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
      {content}
    </AnimatedField>
  )
})
