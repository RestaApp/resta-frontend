import { Search, Briefcase, FileText, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { AppHeader } from './AppHeader'
import { NewsCard } from './NewsCard'
import { cn } from '../utils/cn'
import { cardAnimation, ANIMATION_DELAY_STEP } from '../constants/animations'
import type { EmployeeRole, Screen } from '../types'

interface WorkerHomeProps {
  onNavigate: (destination: Screen) => void
  role: EmployeeRole
}

interface QuickAction {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  onClick: () => void
}

const quickActionsData: Omit<QuickAction, 'onClick'>[] = [
  {
    id: 'vacancies',
    icon: Search,
    label: 'Вакансии',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'shifts',
    icon: Briefcase,
    label: 'Экстра смены',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'applications',
    icon: FileText,
    label: 'Мои заявки',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'find-replacement',
    icon: Users,
    label: 'Найти замену',
    color: 'from-green-500 to-emerald-500',
  },
]

const newsItems = [
  {
    id: 1,
    title: 'Новые возможности платформы',
    description: 'Теперь вы можете легко находить смены и управлять своим расписанием',
    date: '15 января 2024',
    imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Советы для успешного поиска работы',
    description: 'Узнайте, как эффективно использовать платформу для поиска идеальной смены',
    date: '12 января 2024',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
  },
]

export function WorkerHome({ onNavigate }: WorkerHomeProps) {
  const quickActions: QuickAction[] = quickActionsData.map(action => ({
    ...action,
    onClick: () => onNavigate(action.id as Screen),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      <AppHeader onNavigate={onNavigate} />
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                initial={cardAnimation.initial}
                animate={cardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * index }}
                onClick={action.onClick}
                className={cn(
                  'bg-card/60 backdrop-blur-xl rounded-3xl p-5 border-2 border-transparent',
                  'hover:border-primary/20 hover:shadow-lg hover:scale-[1.02]',
                  'transition-all duration-300 text-left'
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-3 shadow-md',
                    action.color
                  )}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-base">{action.label}</h3>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          initial={cardAnimation.initial}
          animate={cardAnimation.animate}
          transition={{ delay: ANIMATION_DELAY_STEP * 4 }}
          className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-transparent mb-6"
        >
          <h3 className="font-semibold text-lg mb-4">Активные смены</h3>
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет активных смен</p>
          </div>
        </motion.div>

        <motion.div
          initial={cardAnimation.initial}
          animate={cardAnimation.animate}
          transition={{ delay: ANIMATION_DELAY_STEP * 5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Новости</h2>
          <div className="space-y-3">
            {newsItems.map((news, index) => (
              <motion.div
                key={news.id}
                initial={cardAnimation.initial}
                animate={cardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * (6 + index) }}
              >
                <NewsCard
                  title={news.title}
                  description={news.description}
                  date={news.date}
                  imageUrl={news.imageUrl}
                  onClick={() => {
                    // TODO: Реализовать открытие детального экрана новости
                    void news.id
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
