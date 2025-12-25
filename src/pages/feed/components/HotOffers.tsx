import type { JSX } from 'react'
import { Flame } from 'lucide-react'

interface HotOffer {
    id: number
    emoji: string
    boost: string
    time: string
}

interface HotOffersProps {
    items: HotOffer[]
}

export const HotOffers = ({ items }: HotOffersProps): JSX.Element => {
    return (
        <div className="px-4 py-4 bg-card">
            <h3 className="mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#d16b9f]" />
                Горящие предложения
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {items.map(hot => (
                    <div
                        key={hot.id}
                        className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-[#d16b9f]/10 to-[#d16b9f]/5 border-2 border-[#d16b9f] rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <span className="text-3xl mb-2">{hot.emoji}</span>
                        <p className="text-[#d16b9f] mb-1">{hot.boost}</p>
                        <p className="text-muted-foreground">{hot.time}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}


