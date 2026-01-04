import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DatePickerProps {
    value: string | null // YYYY-MM-DD
    onChange: (date: string | null) => void
    placeholder?: string
    minDate?: string // YYYY-MM-DD
    className?: string
    label?: string
}

export const DatePicker = ({
    value,
    onChange,
    placeholder = 'ДД.ММ.ГГГГ',
    minDate,
    className,
    label,
}: DatePickerProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value || null)
    }

    const minDateValue = minDate || new Date().toISOString().split('T')[0]

    return (
        <div className={cn('relative', className)}>
            {label && (
                <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
            )}
            <div className="relative">
                <input
                    type="date"
                    value={value || ''}
                    onChange={handleChange}
                    min={minDateValue}
                    className={cn(
                        'w-full px-3 py-2 pr-10 bg-card/60 border border-border rounded-xl',
                        'text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'transition-all',
                        '[&::-webkit-calendar-picker-indicator]:opacity-0',
                        '[&::-webkit-calendar-picker-indicator]:absolute',
                        '[&::-webkit-calendar-picker-indicator]:inset-0',
                        '[&::-webkit-calendar-picker-indicator]:w-full',
                        '[&::-webkit-calendar-picker-indicator]:h-full',
                        '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
                        '[&::-moz-calendar-picker-indicator]:opacity-0',
                        !value && 'text-transparent',
                        value && 'text-foreground'
                    )}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                {!value && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                        {placeholder}
                    </span>
                )}
            </div>
        </div>
    )
}

