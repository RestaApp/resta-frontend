import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { OVERLAY_SCRIM_CLASS } from '@/components/ui/ui-patterns'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { cn } from '@/shared/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { ChangeEvent, KeyboardEvent, ReactNode, RefObject } from 'react'
import { useAnchoredDropdownRect } from './useAnchoredDropdownRect'
import type { SelectOption } from './types'

interface SelectDropdownProps {
  isOpen: boolean
  withOverlay?: boolean
  /** Рендер в portal с fixed-позицией относительно anchorRef (для drawer/footer). */
  portaled?: boolean
  anchorRef?: RefObject<HTMLElement | null>
  isLoading?: boolean
  loadingContent?: ReactNode
  footerContent?: ReactNode
  searchable?: boolean
  displayPlaceholder: string
  label?: string
  value: string
  searchQuery: string
  filteredOptions: SelectOption[]
  searchInputRef: RefObject<HTMLInputElement | null>
  scrollContainerRef: RefObject<HTMLDivElement | null>
  dropdownRef: RefObject<HTMLDivElement | null>
  listboxId: string
  onClose: () => void
  onChangeSearch: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onSelect: (value: string) => void
  t: (key: string) => string
}

export const SelectDropdown = ({
  isOpen,
  withOverlay = false,
  portaled = false,
  anchorRef,
  isLoading = false,
  loadingContent,
  footerContent,
  searchable = false,
  displayPlaceholder,
  label,
  value,
  searchQuery,
  filteredOptions,
  searchInputRef,
  scrollContainerRef,
  dropdownRef,
  listboxId,
  onClose,
  onChangeSearch,
  onKeyDown,
  onSelect,
  t,
}: SelectDropdownProps) => {
  const reduceVisualEffects = useReducedVisualEffects()
  const anchoredRect = useAnchoredDropdownRect(isOpen && portaled, anchorRef ?? { current: null })

  const dropdownPanel = (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(portaled ? 'fixed' : 'absolute left-0 right-0 top-full mt-1 w-full')}
      style={{
        zIndex: Z_INDEX.popover + 1,
        ...(portaled && anchoredRect
          ? {
              top: anchoredRect.top,
              left: anchoredRect.left,
              width: anchoredRect.width,
            }
          : undefined),
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
          id={listboxId}
          ref={scrollContainerRef}
          role="listbox"
          aria-label={label ?? displayPlaceholder}
          className="overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{
            maxHeight: portaled && anchoredRect ? `${anchoredRect.maxHeight}px` : '215px',
          }}
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
                      onMouseDown={e => e.preventDefault()}
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
  )

  const dropdownLayer = (
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
              className={cn(
                'fixed inset-0',
                OVERLAY_SCRIM_CLASS,
                reduceVisualEffects ? 'backdrop-blur-none' : undefined
              )}
              onPointerDown={e => {
                if (e.target === e.currentTarget) onClose()
              }}
            />
          ) : null}
          {(!portaled || anchoredRect) && dropdownPanel}
        </>
      )}
    </AnimatePresence>
  )

  if (portaled && typeof document !== 'undefined') {
    return createPortal(dropdownLayer, document.body)
  }

  return dropdownLayer
}
