import { AnimatePresence, motion } from 'motion/react'
import { Check, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import type { SelectOption } from './types'
import { INPUT_FIELD_INTERACTIVE_CLASS, INPUT_FIELD_BASE_CLASS } from '@/components/ui/ui-patterns'

interface DropdownPosition {
  left: number
  top: number
  width: number
  opensUp: boolean
}

interface SelectDropdownProps {
  isOpen: boolean
  searchable: boolean
  displayPlaceholder: string
  label?: string
  value: string
  searchQuery: string
  filteredOptions: SelectOption[]
  maxHeight: number
  dropdownPosition: DropdownPosition
  needsScroll: boolean
  isScrolledToBottom: boolean
  searchInputRef: RefObject<HTMLInputElement | null>
  scrollContainerRef: RefObject<HTMLDivElement | null>
  dropdownRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onChangeSearch: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onSelect: (value: string) => void
  t: (key: string) => string
}

export const SelectDropdown = ({
  isOpen,
  searchable,
  displayPlaceholder,
  label,
  value,
  searchQuery,
  filteredOptions,
  maxHeight,
  dropdownPosition,
  needsScroll,
  isScrolledToBottom,
  searchInputRef,
  scrollContainerRef,
  dropdownRef,
  onClose,
  onChangeSearch,
  onKeyDown,
  onSelect,
  t,
}: SelectDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/20"
            onPointerDown={e => {
              if (e.target === e.currentTarget) onClose()
            }}
          />

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: dropdownPosition.opensUp ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition.opensUp ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[61] overflow-hidden rounded-xl border border-border/30 bg-card shadow-lg backdrop-blur-sm"
            style={{
              maxHeight: `${maxHeight}px`,
              left: `${dropdownPosition.left}px`,
              top: `${dropdownPosition.top}px`,
              width: `${dropdownPosition.width}px`,
              maxWidth: 'calc(100vw - 32px)',
            }}
          >
            {searchable ? (
              <div className="sticky top-0 z-10 border-b border-border/30 bg-card/95 backdrop-blur-sm p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDown}
                    placeholder={displayPlaceholder}
                    className={cn(
                      INPUT_FIELD_BASE_CLASS,
                      INPUT_FIELD_INTERACTIVE_CLASS,
                      'h-9 rounded-lg border-border/30 pl-9 pr-3 text-sm'
                    )}
                  />
                </div>
              </div>
            ) : null}

            <div
              ref={scrollContainerRef}
              role="listbox"
              aria-label={label ?? displayPlaceholder}
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: `${searchable ? maxHeight - 88 : maxHeight}px` }}
            >
              <div className="p-2">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    {searchQuery.trim() ? t('common.nothingFound') : t('common.noOptions')}
                  </div>
                ) : (
                  <>
                    {filteredOptions.map(option => {
                      const isSelected = value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => onSelect(option.value)}
                          className={cn(
                            'relative flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors',
                            'hover:bg-primary/10 focus:bg-primary/10 focus:outline-none',
                            isSelected && 'bg-primary/10 font-medium'
                          )}
                        >
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                          {!isSelected && <div className="h-4 w-4 shrink-0" />}
                          <span
                            className={cn('flex-1 min-w-0 truncate', isSelected && 'font-semibold')}
                          >
                            {option.label}
                          </span>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </div>

            {needsScroll && !isScrolledToBottom && (
              <div className="sticky bottom-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
            )}

            <div className="h-px bg-border/30" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
