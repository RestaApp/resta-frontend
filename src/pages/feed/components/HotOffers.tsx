interface HotOffer {
    id: number
    emoji: string
    boost: string
    time: string
    restaurant: string // Добавим название ресторана
}

interface HotOffersProps {
    items: HotOffer[]
    onItemClick?: (item: HotOffer) => void
}

export const HotOffers = ({ items, onItemClick }: HotOffersProps) => {
    const handleItemClick = (item: HotOffer) => {
        if (onItemClick) {
            onItemClick(item)
        }
    }

    return (
        <div className="py-2">
            <div className="px-4 mb-3 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">🔥</span> Горящие смены
                </h3>
                <span className="text-xs text-primary font-medium cursor-pointer">Все</span>
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
                {items.map(hot => (
                    <div
                        key={hot.id}
                        onClick={() => handleItemClick(hot)}
                        className="snap-center flex-shrink-0 w-[100px] h-[130px] relative overflow-hidden rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer group active:scale-95 transition-transform"
                    >
                        {/* Градиентный фон при наведении или всегда */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-colors" />

                        {/* Бейдж буста */}
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                            {hot.boost}
                        </div>

                        <div className="mt-2 text-3xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                            {hot.emoji}
                        </div>

                        <div className="text-center w-full z-10">
                            <p className="text-[10px] text-muted-foreground truncate w-full mb-0.5">{hot.restaurant}</p>
                            <p className="text-xs font-bold text-foreground leading-tight">{hot.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}