import { Field } from './Field'
import { SelectableTagButton } from '@/features/roleSelector/ui/subRoles/shared/SelectableTagButton'
import { getSpecializationLabel } from '@/constants/labels'

interface MultiSelectSpecializationsProps {
    label: string
    value: string[]
    onChange: (value: string[]) => void
    options: string[]
    placeholder?: string
    disabled?: boolean
    hint?: string
    isLoading?: boolean
}

export const MultiSelectSpecializations = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    hint,
    isLoading = false,
}: MultiSelectSpecializationsProps) => {
    const handleToggle = (spec: string) => {
        if (disabled) return
        if (value.includes(spec)) {
            onChange(value.filter(s => s !== spec))
        } else {
            onChange([...value, spec])
        }
    }

    return (
        <Field label={label} hint={hint}>
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground py-2">Загрузка специализаций...</div>
                ) : options.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                        {placeholder || 'Нет доступных специализаций'}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {options.map((spec) => (
                            <SelectableTagButton
                                key={spec}
                                value={spec}
                                label={getSpecializationLabel(spec)}
                                isSelected={value.includes(spec)}
                                onClick={handleToggle}
                                disabled={disabled}
                                ariaLabel={`Выбрать специализацию: ${getSpecializationLabel(spec)}`}
                            />
                        ))}
                    </div>
                )}
                {value.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                        Выбрано: {value.length} {value.length === 1 ? 'специализация' : value.length < 5 ? 'специализации' : 'специализаций'}
                    </div>
                )}
            </div>
        </Field>
    )
}
