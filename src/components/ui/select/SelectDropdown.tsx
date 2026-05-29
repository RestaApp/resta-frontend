import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { ChangeEvent, KeyboardEvent, ReactNode, RefObject } from 'react'
import type { SelectOption } from './types'

interface SelectDropdownProps {
  isOpen: boolean
  withOverlay?: boolean
  isLoading?: boolean
  loadingContent?: ReactNode
  footerContent?: ReactNode
  searchable: boolean
  displayPlaceholder: string
  label?: string
  value: string
  searchQuery: string
  filteredOptions: SelectOption[]
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
  withOverlay = true,
  isLoading = false,
  loadingContent,
  footerContent,
  searchable,
  displayPlaceholder,
  label,
  value,
  searchQuery,
  filteredOptions,
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
          {withOverlay ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ zIndex: Z_INDEX.popover }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40"
              onPointerDown={e => {
                if (e.target === e.currentTarget) onClose()
              }}
            />
          ) : null}

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-1 w-full"
            style={{
              zIndex: Z_INDEX.popover + 1,
            }}
          >
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              {searchable ? (
                <div className="border-b border-border">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDown}
                    placeholder={displayPlaceholder}
                    className={cn(
                      'w-full h-10 border-0 bg-transparent px-4 text-sm text-foreground caret-foreground',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none'
                    )}
                  />
                </div>
              ) : null}

              <div
                ref={scrollContainerRef}
                role="listbox"
                aria-label={label ?? displayPlaceholder}
                className="overflow-y-auto overflow-x-hidden overscroll-contain"
                style={{ maxHeight: '215px' }}
              >
                {isLoading ? (
                  loadingContent
                ) : filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                    {searchQuery.trim() ? t('common.nothingFound') : t('common.noOptions')}
                  </div>
                ) : (
                  <ul className="py-1">
                    {filteredOptions.map(option => {
                      const isSelected = value === option.value
                      return (
                        <li key={option.value}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            data-haptic="selection"
                            onClick={() => onSelect(option.value)}
                            className={cn(
                              'w-full px-4 py-2 text-left text-sm text-foreground transition-colors',
                              'hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none',
                              isSelected && 'bg-secondary/50 font-medium'
                            )}
                          >
                            {option.label}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              {footerContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
