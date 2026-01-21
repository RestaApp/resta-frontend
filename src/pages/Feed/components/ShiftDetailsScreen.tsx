import { memo, useCallback, useMemo } from 'react'
import type React from 'react'
import {
    MapPin,
    Clock,
    DollarSign,
    FileText,
    CalendarDays,
    X,
    Users,
    Briefcase,
    type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import { getRestaurantFormatLabel } from '@/constants/labels'
import { useShiftDetails } from '../hooks/useShiftDetails'
import { formatReviews } from '../utils/formatting'
import { getCurrentUserId } from '@/utils/user'
import { StatusPill, UrgentPill, type ShiftStatus } from './StatusPill'

interface ShiftDetailsScreenProps {
    shift: Shift | null
    vacancyData?: VacancyApiItem | null
    applicationId?: number | null
    isOpen: boolean
    onClose: () => void
    onApply: (id: number) => Promise<void>
    isApplied: boolean
    onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
    isLoading?: boolean
}

interface DetailRowProps {
    icon: LucideIcon
    iconColor?: string
    label: string
    value: string | React.ReactNode
    subValue?: string | React.ReactNode
    action?: React.ReactNode
}

const DetailRow = memo(({ icon: Icon, iconColor = 'text-primary', label, value, subValue, action }: DetailRowProps) => (
    <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
            <div className="text-[12px] text-muted-foreground mb-1">{label}</div>
            <div className="text-[14px] font-medium">{value}</div>
            {subValue ? <div className="text-[12px] text-muted-foreground mt-1">{subValue}</div> : null}
            {action}
        </div>
    </div>
))
DetailRow.displayName = 'DetailRow'

interface TextCardProps {
    icon: LucideIcon
    title: string
    content: string
}

const TextCard = memo(({ icon: Icon, title, content }: TextCardProps) => (
    <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-5 h-5 text-primary" />
            <h2 className="text-[16px] font-medium">{title}</h2>
        </div>
        <div className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">{content}</div>
    </Card>
))
TextCard.displayName = 'TextCard'

export const ShiftDetailsScreen = memo((props: ShiftDetailsScreenProps) => {
    const {
        shift,
        vacancyData,
        applicationId = null,
        isOpen,
        onClose,
        onApply,
        isApplied,
        onCancel,
        isLoading = false,
    } = props

    const { restaurantInfo, hourlyRate, shiftTypeLabel, vacancyTitle, positionLabel, specializationLabel, applicationsInfo } =
        useShiftDetails(shift, vacancyData)

    const currentUserId = getCurrentUserId()
    const isOwner = Boolean(currentUserId && shift?.ownerId && shift.ownerId === currentUserId)

    if (!shift) return null

    const appStatus: ShiftStatus = vacancyData?.my_application?.status ?? (shift as any).applicationStatus ?? null
    const isAccepted = appStatus === 'accepted'

    const paySuffix = useMemo(() => {
        const base =
            shift.payPeriod === 'month'
                ? 'за месяц'
                : 'за смену'

        if (!hourlyRate) return base
        return `${base} (${hourlyRate} ${shift.currency}/час)`
    }, [shift.payPeriod, hourlyRate, shift.currency])

    const handleApply = useCallback(async () => {
        try {
            await onApply(shift.id)
            onClose()
        } catch {
            // toast/ошибка уже должны обрабатываться выше по стеку
        }
    }, [shift.id, onApply, onClose])

    const handleCancel = useCallback(async () => {
        const appId = applicationId ?? shift.applicationId ?? vacancyData?.my_application?.id ?? null
        try {
            await onCancel(appId, shift.id)
            onClose()
        } catch {
            // toast/ошибка уже должны обрабатываться выше по стеку
        }
    }, [applicationId, shift.applicationId, vacancyData, shift.id, onCancel, onClose])

    const handleOpenMap = useCallback(() => {
        // TODO: открыть карту
    }, [])

    return (
        <Drawer open={isOpen} onOpenChange={onClose} bottomOffsetPx={76}>
            <DrawerHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                    <DrawerTitle className="text-xl">{vacancyTitle}</DrawerTitle>
                    <button
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-primary transition-colors"
                        aria-label="Закрыть"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{shift.restaurant}</Badge>

                    {shift.urgent ? (
                        // Важно: "Срочно" брендовый, чтобы не конфликтовать с rejected/destructive
                        <UrgentPill />
                    ) : null}

                    {shiftTypeLabel ? (
                        <Badge variant="outline" className="gap-1">
                            <Briefcase className="w-3 h-3" />
                            {shiftTypeLabel}
                        </Badge>
                    ) : null}

                    {/* Статус заявки — в стиле проекта */}
                    <StatusPill status={appStatus} />
                </div>
            </DrawerHeader>

            <div className="overflow-y-auto px-4 pb-4 space-y-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                            {shift.logo}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1">{shift.restaurant}</h2>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {shift.rating > 0 ? <span>⭐ {shift.rating.toFixed(1)}</span> : null}
                                {restaurantInfo?.reviews ? (
                                    <>
                                        <span>•</span>
                                        <span>
                                            {restaurantInfo.reviews} {formatReviews(restaurantInfo.reviews)}
                                        </span>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                        {positionLabel ? (
                            <DetailRow
                                icon={Briefcase}
                                iconColor="text-indigo-500"
                                label="Позиция"
                                value={positionLabel}
                                subValue={specializationLabel ? `Специализация: ${specializationLabel}` : undefined}
                            />
                        ) : null}

                        <DetailRow icon={CalendarDays} iconColor="text-purple-500" label="Дата" value={shift.date} />

                        <DetailRow
                            icon={Clock}
                            iconColor="text-blue-500"
                            label="Время работы"
                            value={shift.time}
                            subValue={shift.duration ? `Длительность: ${shift.duration}` : undefined}
                        />

                        {shift.location ? (
                            <DetailRow
                                icon={MapPin}
                                iconColor="text-primary"
                                label="Место"
                                value={shift.location}
                                action={
                                    <button onClick={handleOpenMap} className="text-[12px] text-primary hover:underline mt-1">
                                        Посмотреть на карте
                                    </button>
                                }
                            />
                        ) : null}

                        <DetailRow
                            icon={DollarSign}
                            iconColor="text-primary"
                            label="Оплата"
                            value={
                                <span className="text-[18px] font-semibold text-primary">
                                    {shift.pay} {shift.currency}
                                </span>
                            }
                            subValue={paySuffix}
                        />

                        {applicationsInfo ? (
                            <DetailRow
                                icon={Users}
                                iconColor="text-green-500"
                                label="Заявок"
                                value={applicationsInfo.value}
                                subValue={applicationsInfo.label}
                            />
                        ) : null}
                    </div>
                </Card>

                {vacancyData?.description ? <TextCard icon={FileText} title="Описание" content={vacancyData.description} /> : null}
                {vacancyData?.requirements ? <TextCard icon={FileText} title="Требования" content={vacancyData.requirements} /> : null}

                {restaurantInfo ? (
                    <Card className="p-4">
                        <h2 className="text-[16px] font-medium mb-3">О заведении</h2>

                        {restaurantInfo.bio ? <p className="text-[12px] text-muted-foreground mb-2">{restaurantInfo.bio}</p> : null}

                        {restaurantInfo.profile ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {restaurantInfo.profile.city ? (
                                    <Badge variant="outline" className="text-[11px]">
                                        {restaurantInfo.profile.city}
                                    </Badge>
                                ) : null}

                                {(restaurantInfo.profile.restaurant_format || restaurantInfo.profile.format) ? (
                                    <Badge variant="outline" className="text-[11px]">
                                        {getRestaurantFormatLabel(
                                            restaurantInfo.profile.restaurant_format || restaurantInfo.profile.format || ''
                                        )}
                                    </Badge>
                                ) : null}

                                {restaurantInfo.profile.cuisine_types?.length ? (
                                    <Badge variant="outline" className="text-[11px]">
                                        {restaurantInfo.profile.cuisine_types.join(', ')}
                                    </Badge>
                                ) : null}
                            </div>
                        ) : null}
                    </Card>
                ) : null}
            </div>

            <DrawerFooter className="border-t border-border">
                {isOwner ? null : (
                    <div className="flex gap-3">
                        {/* Не показываем метку "подтверждена" в футере */}
                        {isAccepted ? null : isApplied ? (
                            <Button
                                onClick={handleCancel}
                                disabled={isLoading}
                                variant="outline"
                                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                            >
                                {isLoading ? 'Отмена...' : 'Отменить заявку'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleApply}
                                disabled={isLoading}
                                className="flex-1 gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Отправка...' : 'Откликнуться'}
                            </Button>
                        )}
                    </div>
                )}
            </DrawerFooter>
        </Drawer>
    )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
