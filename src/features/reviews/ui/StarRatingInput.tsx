import { memo } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  ariaLabel?: (star: number) => string
}

const STARS = [1, 2, 3, 4, 5]

/** Интерактивный выбор оценки 1–5 звёзд. */
export const StarRatingInput = memo(function StarRatingInput({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1.5" role="radiogroup">
      {STARS.map(star => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={ariaLabel?.(star) ?? String(star)}
            disabled={disabled}
            data-haptic="selection"
            onClick={() => onChange(star)}
            className={cn(
              'rounded-md p-1 transition-transform active:scale-90',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                filled ? 'fill-warning text-warning' : 'text-muted-foreground/30'
              )}
            />
          </button>
        )
      })}
    </div>
  )
})
