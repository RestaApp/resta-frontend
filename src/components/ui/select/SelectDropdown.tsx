import { AnimatePresence, motion } from 'motion/react'
import { Check, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { SHADOW_MODAL_CLASS } from '@/components/ui/ui-patterns'
import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import type { SelectOption } from './types'

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
            style={{ zIndex: Z_INDEX.popover }}
            className="fixed inset-0 bg-black/25 dark:bg-black/40"
            onPointerDown={e => {
              if (e.target === e.currentTarget) onClose()
            }}
          />

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: dropdownPosition.opensUp ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition.opensUp ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed"
            style={{
              zIndex: Z_INDEX.popover + 1,
              maxHeight: `${maxHeight}px`,
              left: `${dropdownPosition.left}px`,
              top: `${dropdownPosition.top}px`,
              width: `${dropdownPosition.width}px`,
              maxWidth: 'calc(100vw - 32px)',
            }}
          >
            <div
              className={cn(
                'h-full overflow-hidden rounded-2xl border border-border/50 bg-card',
                SHADOW_MODAL_CLASS
              )}
            >
              {searchable ? (
                <div className="sticky top-0 z-10 bg-card px-3 pt-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={onChangeSearch}
                      onKeyDown={onKeyDown}
                      placeholder={displayPlaceholder}
                      className={cn(
                        'w-full h-10 rounded-xl border border-border/60 bg-background',
                        'pl-9 pr-3 text-sm text-foreground caret-primary',
                        'placeholder:text-muted-foreground/50',
                        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'transition-all duration-150'
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
                <div className="px-1.5 py-1.5">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      {searchQuery.trim() ? t('common.nothingFound') : t('common.noOptions')}
                    </div>
                  ) : (
                    filteredOptions.map(option => {
                      const isSelected = value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-haptic="selection"
                          onClick={() => onSelect(option.value)}
                          className={cn(
                            'relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base transition-colors duration-100',
                            'active:scale-[0.98] active:transition-transform',
                            isSelected
                              ? 'bg-primary/10 dark:bg-primary/15'
                              : 'hover:bg-elevated/60 dark:hover:bg-elevated/40 focus:bg-elevated/60 dark:focus:bg-elevated/40',
                            'focus:outline-none'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border/80 dark:border-border'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                          </div>
                          <span
                            className={cn(
                              'flex-1 min-w-0 truncate',
                              isSelected ? 'font-semibold text-foreground' : 'text-foreground/85'
                            )}
                          >
                            {option.label}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {needsScroll && !isScrolledToBottom && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 rounded-b-2xl bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
