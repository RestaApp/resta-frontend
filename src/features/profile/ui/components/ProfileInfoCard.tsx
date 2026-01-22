import { memo } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { ApiRole } from '@/types'
import { getProfileCompleteness } from '../../model/utils/profileCompleteness'
type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

interface ProfileInfoCardProps {
  userProfile: any
  apiRole: ApiRole | null
  completeness: ProfileCompleteness | null
  onFill: () => void
}

export const ProfileInfoCard = memo(({ userProfile, apiRole, completeness, onFill }: ProfileInfoCardProps) => {
  const isFilled = completeness?.isFilled ?? false

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Личная информация</h4>
        <Badge variant={isFilled ? 'success' : 'outline'} className="flex items-center gap-1">
          {isFilled ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Заполнено
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              Нужно заполнить
            </>
          )}
        </Badge>
      </div>
      <div className="space-y-2 text-sm">
        {!isFilled ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-2">Заполните обязательные поля профиля</p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onFill}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white gradient-primary"
            >
              Заполнить
            </motion.button>
          </div>
        ) : (
          <>
            {userProfile.bio && (
              <div>
                <span className="text-muted-foreground block mb-1">Описание</span>
                <p className="text-foreground">{userProfile.bio}</p>
              </div>
            )}
            {(userProfile.location || (userProfile as any).city) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Город</span>
                <span>{(userProfile as any).city || userProfile.location}</span>
              </div>
            )}
            {apiRole === 'employee' && userProfile.last_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Фамилия</span>
                <span>{userProfile.last_name}</span>
              </div>
            )}
            {userProfile.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{userProfile.email}</span>
              </div>
            )}
            {userProfile.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон</span>
                <span>{userProfile.phone}</span>
              </div>
            )}
            {userProfile.work_experience_summary && (
              <div>
                <span className="text-muted-foreground block mb-1">
                  {apiRole === 'employee' ? 'Резюме' : 'Опыт работы'}
                </span>
                <p className="text-foreground">{userProfile.work_experience_summary}</p>
              </div>
            )}
            {apiRole === 'employee' && (
              <>
                {userProfile.employee_profile?.experience_years !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Опыт работы</span>
                    <span>
                      {userProfile.employee_profile.experience_years}{' '}
                      {userProfile.employee_profile.experience_years === 1
                        ? 'год'
                        : userProfile.employee_profile.experience_years < 5
                          ? 'года'
                          : 'лет'}
                    </span>
                  </div>
                )}
                {userProfile.employee_profile?.open_to_work !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Открыт к работе</span>
                    <span>{userProfile.employee_profile.open_to_work ? 'Да' : 'Нет'}</span>
                  </div>
                )}
                {userProfile.employee_profile?.skills && userProfile.employee_profile.skills.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Навыки</span>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.employee_profile.skills.map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-1 rounded-md bg-muted text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  )
})
ProfileInfoCard.displayName = 'ProfileInfoCard'
