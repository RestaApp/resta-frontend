import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/utils/cn'
import { Field } from './Field'

interface ShiftLocationFieldProps {
  label: string
  /** Адреса, выбранные/введённые для этой смены. */
  value: string[]
  onChange: (next: string[]) => void
  /** Сохранённые в профиле адреса заведения — показываются как чипы для выбора. */
  profileAddresses: string[]
  placeholder?: string
  error?: string
}

/**
 * Поле адреса(ов) смены для restaurant/supplier.
 *
 * UX: чипы со всеми адресами профиля (можно выбрать несколько одним кликом)
 * + поле ручного ввода с кнопкой «Добавить». Выбранные адреса показаны в
 * виде чипов внизу — можно убрать по одному.
 */
export const ShiftLocationField = memo(function ShiftLocationField({
  label,
  value,
  onChange,
  profileAddresses,
  placeholder,
  error,
}: ShiftLocationFieldProps) {
  const { t } = useTranslation()
  const [manualInput, setManualInput] = useState('')

  const selectedSet = new Set(value.map(item => item.trim()).filter(Boolean))

  const toggle = (address: string) => {
    const trimmed = address.trim()
    if (!trimmed) return
    if (selectedSet.has(trimmed)) {
      onChange(value.filter(item => item.trim() !== trimmed))
    } else {
      onChange([...value, trimmed])
    }
  }

  const remove = (address: string) => {
    const trimmed = address.trim()
    onChange(value.filter(item => item.trim() !== trimmed))
  }

  const addManual = () => {
    const trimmed = manualInput.trim()
    if (!trimmed) return
    if (selectedSet.has(trimmed)) {
      setManualInput('')
      return
    }
    onChange([...value, trimmed])
    setManualInput('')
  }

  return (
    <Field label={label} error={error}>
      <div className="flex flex-col gap-2">
        {profileAddresses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profileAddresses.map(address => {
              const isSelected = selectedSet.has(address.trim())
              return (
                <button
                  key={address}
                  type="button"
                  onClick={() => toggle(address)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {address}
                </button>
              )
            })}
          </div>
        ) : null}

        <div className="flex items-stretch gap-2">
          <Input
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder={placeholder ?? t('shift.locationPlaceholder')}
            autoComplete="street-address"
            enterKeyHint="enter"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addManual()
              }
            }}
            aria-invalid={!!error}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addManual}
            disabled={!manualInput.trim()}
          >
            {t('profile.addAddress', { defaultValue: 'Добавить' })}
          </Button>
        </div>

        {value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map(address => (
              <span
                key={`selected-${address}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm text-primary"
              >
                <span>{address}</span>
                <button
                  type="button"
                  onClick={() => remove(address)}
                  aria-label={t('common.remove', { defaultValue: 'Удалить' })}
                  className="text-primary/70 hover:text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  )
})
