import { Star, Clock } from 'lucide-react'
import type { Shift } from '../types'
import type { JSX } from 'react'

interface ShiftCardProps {
    shift: Shift
    isApplied?: boolean
    onApply: (id: number) => void
}

export const ShiftCard = ({ shift, isApplied = false, onApply }: ShiftCardProps): JSX.Element => {
    return (
        <div className="bg-card rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{shift.logo}</span>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3>{shift.restaurant}</h3>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-gray-600">{shift.rating}</span>
                        </div>
                    </div>
                    <h4 className="text-gray-700">{shift.position}</h4>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-gray-600">
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{shift.date}</span>
                </div>
                <span>•</span>
                <span>{shift.time}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-success">
                    <span className="mr-1">{shift.pay}</span>
                    <span>{shift.currency}</span>
                </div>
                <button
                    onClick={() => onApply(shift.id)}
                    disabled={isApplied}
                    className={`px-6 py-2 rounded-xl transition-all ${isApplied ? 'bg-card/60 text-muted-foreground cursor-not-allowed' : 'gradient-primary text-white hover:opacity-90 shadow-md'}`}
                >
                    {isApplied ? '✓ Заявка отправлена' : 'Откликнуться'}
                </button>
            </div>
        </div>
    )
}


