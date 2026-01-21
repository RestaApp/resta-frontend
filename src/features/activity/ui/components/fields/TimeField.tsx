import { Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRef } from 'react'
import type { KeyboardEvent } from 'react'

type TimeFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
}

export const TimeField = ({ label, value, onChange }: TimeFieldProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const openPicker = () => {
        if (!inputRef.current) return
            ; (inputRef.current as any).showPicker?.() || inputRef.current.focus()
    }

    const onIconKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
        }
    }

    return (
        <div>
            <label className="block mb-2 text-sm text-muted-foreground">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={openPicker}
                    onKeyDown={onIconKey}
                    aria-label={`Открыть выбор времени для ${label}`}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground flex items-center justify-center"
                >
                    <Clock className="w-5 h-5" />
                </button>
                <Input
                    ref={inputRef}
                    type="time"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    className="pl-11"
                />
            </div>
        </div>
    )
}

export default TimeField


