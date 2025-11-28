/**
 * Компонент карточки новости
 */

import { Clock } from 'lucide-react'
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'
import { cn } from '../../../utils/cn'

interface NewsCardProps {
  title: string
  description: string
  date: string
  imageUrl: string
  onClick?: () => void
}

export function NewsCard({ title, description, date, imageUrl, onClick }: NewsCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden',
        'border-2 border-transparent hover:border-primary/20',
        'hover:shadow-lg hover:scale-[1.01] transition-all duration-300',
        'group text-left'
      )}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" strokeWidth={2} />
          <span>{date}</span>
        </div>
      </div>
    </button>
  )
}


