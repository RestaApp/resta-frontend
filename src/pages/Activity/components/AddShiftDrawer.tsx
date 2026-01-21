import { useEffect, useMemo } from 'react'
import { Drawer, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { DatePicker } from '@/components/ui/date-picker'
import type { CreateShiftResponse, VacancyApiItem } from '@/services/api/shiftsApi'
import { useUserPositions } from '@/hooks/useUserPositions'
import { useUserSpecializations } from '@/hooks/useUserSpecializations'
import { getEmployeePositionLabel } from '@/constants/labels'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'
import { Field, TextField, TextAreaField, SelectField, MultiSelectSpecializations, TimeField, MoneyField, CheckboxField } from './fields'
import { useAddShiftForm, type ShiftType } from '../hooks/useAddShiftForm'

type AddShiftDrawerProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (shift: CreateShiftResponse | null) => void
    initialValues?: VacancyApiItem | null
}

type SelectFieldOption = {
    value: string
    label: string
}

const INITIAL_SHIFT_TYPE: ShiftType = 'vacancy'

export const AddShiftDrawer = ({ open, onOpenChange, onSave, initialValues = null }: AddShiftDrawerProps) => {
    const { userProfile } = useUserProfile()
    const { toast, hideToast } = useToast()
    const isEmployeeRole = userProfile?.role === 'employee'
    const isRestaurantRole = userProfile?.role === 'restaurant'
    const lockedShiftType = useMemo<ShiftType | null>(() => {
        if (isEmployeeRole) return 'replacement'
        if (isRestaurantRole) return 'vacancy'
        return null
    }, [isEmployeeRole, isRestaurantRole])

    const form = useAddShiftForm({ initialShiftType: lockedShiftType ?? INITIAL_SHIFT_TYPE, onSave, initialValues })
    const {
        title,
        setTitle,
        description,
        setDescription,
        date,
        setDate,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        pay,
        setPay,
        location,
        setLocation,
        requirements,
        setRequirements,
        shiftType,
        setShiftType,
        urgent,
        setUrgent,
        position: formPosition,
        setPosition: setFormPosition,
        specializations,
        setSpecializations,
        submitError,
        isCreating,
        isFormInvalid,
        timeRangeError,
        handleSave,
    } = form

    const { positions: positionsForDisplay, isLoading: isPositionsLoading } = useUserPositions({ enabled: open })
    const {
        specializations: availableSpecializations,
        isLoading: isSpecializationsLoading,
    } = useUserSpecializations({
        position: formPosition || null,
        enabled: open && !!formPosition,
    })

    useEffect(() => {
        if (!formPosition) {
            setSpecializations([])
        }
    }, [formPosition, setSpecializations])

    const close = () => onOpenChange(false)

    // handleSave provided by hook; when it succeeds we close the drawer

    // timeRangeError and isFormInvalid provided by hook
    const shiftTypeOptions: SelectFieldOption[] = [
        { value: 'vacancy', label: 'Вакансия' },
        { value: 'replacement', label: 'Замена' },
    ]
    const positionsOptions: SelectFieldOption[] = positionsForDisplay.map(item => {
        const value = item.originalValue || item.id
        return {
            value,
            label: item.title || getEmployeePositionLabel(value),
        }
    })

    return (
        <Drawer open={open} onOpenChange={onOpenChange} bottomOffsetPx={76}>
            <DrawerHeader>
                <DrawerTitle>Добавить смену</DrawerTitle>
                <DrawerDescription>Найдите себе замену.</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 p-4">
                <TextField
                    label="Название смены"
                    value={title}
                    onChange={setTitle}
                    placeholder='Например: "Основная работа", "Банкет"'
                />

                <TextAreaField
                    label="Описание"
                    value={description}
                    onChange={setDescription}
                    placeholder="Коротко опишите смену и обязанности"
                    minHeight="96px"
                />

                <Field label="Дата">
                    <DatePicker value={date} onChange={setDate} className="w-full" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <TimeField label="Начало" value={startTime} onChange={setStartTime} />
                    <TimeField label="Конец" value={endTime} onChange={setEndTime} />
                </div>
                {timeRangeError && (
                    <p className="text-sm text-red-500">{timeRangeError}</p>
                )}

                <MoneyField value={pay} onChange={setPay} />

                <TextField
                    label="Локация"
                    value={location}
                    onChange={setLocation}
                    placeholder='Например: "Минск, ул. Ленина 1"'
                />

                <TextAreaField
                    label="Требования"
                    value={requirements}
                    onChange={setRequirements}
                    placeholder="Опыт, навыки, наличие мед. книжки и т.д."
                    minHeight="80px"
                />

                {!isEmployeeRole && (
                    <SelectField
                        label="Тип смены"
                        value={shiftType}
                        onChange={(value) => setShiftType(value as ShiftType)}
                        disabled={!!lockedShiftType}
                        options={shiftTypeOptions}
                        hint={
                            lockedShiftType
                                ? lockedShiftType === 'vacancy'
                                    ? 'Заведения создают только вакансии.'
                                    : 'Сотрудники создают только замены.'
                                : undefined
                        }
                    />
                )}

                <SelectField
                    label="Позиция"
                    value={formPosition}
                    onChange={setFormPosition}
                    options={positionsOptions}
                    placeholder={isPositionsLoading ? 'Загрузка позиций...' : 'Выберите позицию'}

                />

                <MultiSelectSpecializations
                    label="Специализация"
                    value={specializations}
                    onChange={setSpecializations}
                    options={availableSpecializations}
                    placeholder={
                        !formPosition
                            ? 'Сначала выберите позицию'
                            : isSpecializationsLoading
                                ? 'Загрузка специализаций...'
                                : 'Нет доступных специализаций'
                    }
                    disabled={!formPosition}
                    isLoading={isSpecializationsLoading}
                />

                <CheckboxField
                    id="urgent-shift"
                    label="Срочная смена"
                    checked={urgent}
                    onChange={setUrgent}
                />

                {submitError && (
                    <p className="text-sm text-red-500">{submitError}</p>
                )}
            </div>

            <DrawerFooter>
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={close} className="py-3 rounded-xl border-2" style={{ borderColor: 'var(--border)' }}>
                        Отмена
                    </button>
                    <button
                        onClick={async () => {
                            const ok = await handleSave()
                            if (ok) close()
                        }}
                        disabled={isFormInvalid || isCreating}
                        style={{ background: 'var(--gradient-primary)' }}
                        className="py-3 rounded-xl text-white disabled:opacity-50"
                    >
                        {isCreating ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                </div>
            </DrawerFooter>
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </Drawer>
    )
}

export default AddShiftDrawer
