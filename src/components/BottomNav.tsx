/**
 * Компонент нижней навигации
 * Отображает табы в зависимости от роли пользователя
 */

import { motion } from 'motion/react'
import { getTabsForRole } from '@/constants/tabs'
import { isEmployeeRole } from '@/utils/roles'
import type { UserRole, Tab } from '@/types'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  role: UserRole
}

export const BottomNav = ({ activeTab, onTabChange, role }: BottomNavProps) => {
  const tabs = getTabsForRole(role)
  const isEmployee = isEmployeeRole(role)

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t z-50 ${isEmployee
        ? 'bg-background/80 backdrop-blur-xl border-border'
        : 'bg-background border-border'
        }`}
    >
      <div className="flex justify-around items-center max-w-2xl mx-auto px-4 py-2 safe-area-bottom">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center py-2 px-3 relative min-w-[60px]"
            >
              <div className="relative">
                <div
                  style={{
                    color: isActive ? 'var(--pink-electric)' : 'var(--muted-foreground)',
                  }}
                >
                  <Icon
                    className="w-6 h-6 transition-colors"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 rounded-full -z-10"
                    style={{
                      background: 'var(--gradient-glow)',
                    }}
                  />
                )}
              </div>
              <span
                className="text-xs mt-1 transition-colors"
                style={{
                  color: isActive ? 'var(--pink-electric)' : 'var(--muted-foreground)',
                }}
              >
                {label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
