import { memo, useCallback, useMemo } from 'react'
import type React from 'react'
import {
    MapPin,
    Clock,
    DollarSign,
    FileText,
    MessageCircle,
    CalendarDays,
    Flame,
    Star,
    X,
    type LucideIcon,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Drawer, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/drawer'
import type { Shift } from '../types'
import type { VacancyApiItem } from '../../../services/api/shiftsApi'


interface ShiftDetailsScreenProps {
    shift: Shift | null
    vacancyData?: VacancyApiItem | null
    isOpen: boolean
    onClose: () => void
    onApply: (id: number) => void
    isApplied?: boolean
}

/**
 * Компонент для отображения одной строки деталей
 */
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
            {subValue && <div className="text-[12px] text-muted-foreground mt-1">{subValue}</div>}
            {action}
        </div>
    </div>
))

DetailRow.displayName = 'DetailRow'

/**
 * Компонент для отображения карточки с текстом (описание, требования)
 */
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
        <div className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
            {content}
        </div>
    </Card>
))

TextCard.displayName = 'TextCard'

/**
 * Форматирует количество отзывов
 */
const formatReviews = (count: number): string => {
    if (count === 1) return 'отзыв'
    if (count < 5) return 'отзыва'
    return 'отзывов'
}

export const ShiftDetailsScreen = memo(({
    shift,
    vacancyData,
    isOpen,
    onClose,
    onApply,
    isApplied = false,
}: ShiftDetailsScreenProps) => {
    const handleApply = useCallback(() => {
        if (shift) {
            onApply(shift.id)
            onClose()
        }
    }, [shift, onApply, onClose])

    const handleContact = useCallback(() => {
        // TODO: Реализовать открытие чата Telegram
    }, [])

    const handleOpenMap = useCallback(() => {
        // TODO: Реализовать открытие карты
    }, [])

    // Мемоизация данных о ресторане
    const restaurantInfo = useMemo(() => {
        if (!vacancyData?.user) return null

        const { user } = vacancyData
        const hasRating = user.average_rating !== undefined && user.average_rating > 0
        const hasReviews = user.total_reviews !== undefined && user.total_reviews > 0

        return {
            rating: hasRating ? user.average_rating : null,
            reviews: hasReviews ? user.total_reviews : null,
            bio: user.bio || null,
            profile: user.restaurant_profile || null,
        }
    }, [vacancyData])

    // Ранний возврат если нет данных
    if (!shift) {
        return <></>
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                    <DrawerTitle className="text-xl">{shift.position}</DrawerTitle>
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
                    {shift.urgent && (
                        <Badge variant="destructive" className="gap-1">
                            <Flame className="w-3 h-3" />
                            Срочно
                        </Badge>
                    )}
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{shift.rating.toFixed(1)}</span>
                    </div>
                </div>
            </DrawerHeader>

            <div className="overflow-y-auto px-4 pb-4 space-y-4">
                {/* Header Card */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                            {shift.logo}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1">{shift.restaurant}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>⭐ {shift.rating.toFixed(1)}</span>
                                {restaurantInfo?.reviews && (
                                    <>
                                        <span>•</span>
                                        <span>
                                            {restaurantInfo.reviews} {formatReviews(restaurantInfo.reviews)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Separator className="my-4" />

                    {/* Key Details */}
                    <div className="space-y-3">
                        <DetailRow
                            icon={CalendarDays}
                            iconColor="text-purple-500"
                            label="Дата"
                            value={shift.date}
                        />
                        <DetailRow
                            icon={Clock}
                            iconColor="text-blue-500"
                            label="Время работы"
                            value={shift.time}
                            subValue={shift.duration ? `Длительность: ${shift.duration}` : undefined}
                        />
                        {shift.location && (
                            <DetailRow
                                icon={MapPin}
                                iconColor="text-primary"
                                label="Место"
                                value={shift.location}
                                action={
                                    <button
                                        onClick={handleOpenMap}
                                        className="text-[12px] text-primary hover:underline mt-1"
                                    >
                                        Посмотреть на карте
                                    </button>
                                }
                            />
                        )}
                        <DetailRow
                            icon={DollarSign}
                            iconColor="text-primary"
                            label="Оплата"
                            value={
                                <span className="text-[18px] font-semibold text-primary">
                                    {shift.pay} {shift.currency}
                                </span>
                            }
                            subValue="за смену"
                        />
                    </div>
                </Card>

                {/* Description */}
                {vacancyData?.description && (
                    <TextCard icon={FileText} title="Описание" content={vacancyData.description} />
                )}

                {/* Requirements */}
                {vacancyData?.requirements && (
                    <TextCard icon={FileText} title="Требования" content={vacancyData.requirements} />
                )}

                {/* Restaurant Info */}
                {restaurantInfo && (
                    <Card className="p-4">
                        <h2 className="text-[16px] font-medium mb-3">О заведении</h2>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <span className="text-[16px] font-bold text-primary">
                                    {shift.restaurant.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <div className="text-[14px] font-medium">{shift.restaurant}</div>
                                {restaurantInfo.rating && (
                                    <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                        <span>⭐ {restaurantInfo.rating.toFixed(1)}</span>
                                        {restaurantInfo.reviews && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    {restaurantInfo.reviews} {formatReviews(restaurantInfo.reviews)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {restaurantInfo.bio && (
                            <p className="text-[12px] text-muted-foreground mb-2">{restaurantInfo.bio}</p>
                        )}
                        {restaurantInfo.profile && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {restaurantInfo.profile.city && (
                                    <Badge variant="outline" className="text-[11px]">
                                        {restaurantInfo.profile.city}
                                    </Badge>
                                )}
                                {restaurantInfo.profile.format && (
                                    <Badge variant="outline" className="text-[11px]">
                                        {restaurantInfo.profile.format}
                                    </Badge>
                                )}
                                {restaurantInfo.profile.cuisine_types &&
                                    restaurantInfo.profile.cuisine_types.length > 0 && (
                                        <Badge variant="outline" className="text-[11px]">
                                            {restaurantInfo.profile.cuisine_types.join(', ')}
                                        </Badge>
                                    )}
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Fixed Bottom Actions */}
            <DrawerFooter className="border-t border-border">
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleContact} className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        <span>Связаться</span>
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={isApplied}
                        className="flex-1 gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isApplied ? '✓ Заявка отправлена' : 'Откликнуться'}
                    </Button>
                </div>
            </DrawerFooter>
        </Drawer>
    )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
