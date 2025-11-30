import { useState, useCallback } from 'react'
import { EditProfileDialog } from './components/EditProfileDialog'
import {
  Edit,
  Star,
  Award,
  Briefcase,
  Settings,
  Bell,
  HelpCircle,
  Plus,
  UserCircle,
} from 'lucide-react'
import { AppHeader } from '../home/components/AppHeader'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { Separator } from '../../components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { BottomNav } from '../../components/BottomNav'
import { EmployeeSubRoleSelector } from '../role-selector/components/EmployeeSubRoleSelector'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setSelectedRole } from '../../store/userSlice'
import { useUserProfile } from '../../hooks/useUserProfile'
import { ROLE_LABELS } from '../../constants/roles'
import { isEmployeeRole, isVenueRole, isSupplierRole, canViewShifts } from '../../utils/roles'
import { ROUTES } from '../../constants/routes'
import type { Tab, Screen, EmployeeRole } from '../../types'

interface ProfileScreenProps {
  onNavigate: (destination: Screen) => void
  onBack?: () => void
  activeTab?: Tab
  onTabChange?: (tab: string) => void
}

export function ProfileScreen({ onNavigate, onBack, activeTab, onTabChange }: ProfileScreenProps) {
  const dispatch = useAppDispatch()
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false)
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)
  const role = useAppSelector(state => state.user.selectedRole)
  const { userProfile } = useUserProfile()

  const isEmployee = isEmployeeRole(role)
  const isRestaurant = isVenueRole(role)
  const isSupplier = isSupplierRole(role)

  // Используем данные из API или значения по умолчанию
  const profile = {
    name: userProfile?.full_name || userProfile?.name || (isRestaurant ? 'Ресторан' : isSupplier ? 'Поставщик' : 'Пользователь'),
    role: role ? ROLE_LABELS[role] : userProfile?.role || 'Не указано',
    position: userProfile?.position || userProfile?.employee_profile?.position || null,
    rating: userProfile?.average_rating || 0,
    reviewCount: userProfile?.total_reviews || 0,
    shiftsCompleted: isRestaurant ? 124 : 47, // TODO: получить из API
    experience: userProfile?.experience_years ? `${userProfile.experience_years} ${userProfile.experience_years === 1 ? 'год' : userProfile.experience_years < 5 ? 'года' : 'лет'}` : 'Не указано',
    certificates: isEmployee
      ? ['Безопасность пищи', 'Профессиональный повар', 'Управление кухней'] // TODO: получить из API
      : isRestaurant
        ? ['Лицензия на общепит', 'Сертификат качества']
        : ['ИП', 'Оптовые поставки'],
  }

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleChangeRole = useCallback(() => {
    if (isEmployee) {
      // Для сотрудников показываем экран выбора подроли
      setShowEmployeeSubRoles(true)
      setShowChangeRoleDialog(false)
    } else {
      // Для заведений и поставщиков показываем диалог подтверждения
      setShowChangeRoleDialog(true)
    }
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [isEmployee])

  const handleConfirmChangeRole = useCallback(() => {
    dispatch(setSelectedRole(null))
    setShowChangeRoleDialog(false)
    if (onBack) {
      onBack()
    }
  }, [onBack, dispatch])

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole) => {
    setSelectedSubRole(subRole)
  }, [])

  const handleSubRoleContinue = useCallback(() => {
    if (selectedSubRole) {
      dispatch(setSelectedRole(selectedSubRole))
      setShowEmployeeSubRoles(false)
      setSelectedSubRole(null)
      // Перезагружаем страницу для применения изменений
      window.location.reload()
    }
  }, [selectedSubRole, dispatch])

  const handleToast = useCallback((message: string) => {
    // TODO: Реализовать toast уведомления
    void message
  }, [])

  const menuItems = [
    {
      icon: Edit,
      label: 'Редактировать профиль',
      action: () => handleToast('Скоро будет доступно'),
    },
    {
      icon: UserCircle,
      label: 'Сменить специализацию',
      action: () => handleChangeRole(),
    },
    {
      icon: Bell,
      label: 'Уведомления',
      action: () => onNavigate(ROUTES.NOTIFICATIONS),
    },
    ...(canViewShifts(role)
      ? [
        {
          icon: Briefcase,
          label: 'Мои смены',
          action: () => onNavigate(ROUTES.SHIFTS),
        },
      ]
      : []),
    {
      icon: Settings,
      label: 'Настройки',
      action: () => onNavigate(ROUTES.SETTINGS),
    },
    {
      icon: HelpCircle,
      label: 'Помощь и поддержка',
      action: () => handleToast('Скоро будет доступно'),
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Экран выбора подроли для сотрудников
  if (showEmployeeSubRoles) {
    return (
      <EmployeeSubRoleSelector
        currentRole={role}
        onSelectSubRole={handleSubRoleSelect}
        selectedSubRole={selectedSubRole}
        onContinue={handleSubRoleContinue}
        onBack={() => setShowEmployeeSubRoles(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader onNavigate={onNavigate} title="Профиль" />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={userProfile?.photo_url || userProfile?.profile_photo_url || null}
                alt={profile.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-[24px]">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-[20px] font-medium mb-1">{profile.name}</h1>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{profile.role}</Badge>
                {profile.position && (
                  <Badge variant="outline" className="text-xs">
                    {profile.position}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[14px]">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">{profile.rating > 0 ? profile.rating.toFixed(1) : '—'}</span>
                </div>
                <span className="text-muted-foreground">
                  • {profile.reviewCount} {profile.reviewCount === 1 ? 'отзыв' : profile.reviewCount < 5 ? 'отзыва' : 'отзывов'}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 flex items-center justify-center"
            onClick={() => setShowEditProfileDialog(true)}
          >
            <Edit className="w-4 h-4" />
            Редактировать профиль
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Briefcase className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-[18px] font-semibold">{profile.shiftsCompleted}</div>
            <div className="text-[10px] text-muted-foreground">Смен</div>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-[18px] font-semibold">{profile.experience}</div>
            <div className="text-[10px] text-muted-foreground">Опыт</div>
          </Card>
          <Card className="p-4 text-center">
            <Star className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-[18px] font-semibold">{profile.rating}</div>
            <div className="text-[10px] text-muted-foreground">Рейтинг</div>
          </Card>
        </div>

        {/* Certificates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-medium">Сертификаты</h2>
            <button
              onClick={() => handleToast('Скоро будет доступно')}
              className="text-primary hover:underline text-[12px]"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.certificates.map((cert, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                {cert}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 flex items-center justify-center"
              onClick={() => handleToast('Скоро будет доступно')}
            >
              <Plus className="w-3 h-3" />
              Добавить
            </Button>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="p-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index}>
                <button
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors min-h-[56px]"
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-left text-[14px]">{item.label}</span>
                  <span className="text-muted-foreground">›</span>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            )
          })}
        </Card>

        {/* For Restaurants */}
        {isRestaurant && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-[14px] font-medium mb-2">Быстрые действия</h3>
            <p className="text-[12px] text-muted-foreground mb-4">
              Создайте вакансию и найдите квалифицированных специалистов
            </p>
            <Button className="w-full" onClick={() => onNavigate(ROUTES.CREATE_SHIFT)}>
              Создать вакансию
            </Button>
          </Card>
        )}

        {/* For Suppliers */}
        {isSupplier && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-[14px] font-medium mb-2">Для поставщиков</h3>
            <p className="text-[12px] text-muted-foreground mb-4">
              Управляйте каталогом товаров и находите новых клиентов
            </p>
            <Button className="w-full" onClick={() => handleToast('Скоро будет доступно')}>
              Каталог товаров
            </Button>
          </Card>
        )}

      </div>

      {/* Change Role Dialog */}
      <AlertDialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <AlertDialogContent className="max-w-[340px] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Сменить роль?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите сменить роль? Вам нужно будет выбрать новую роль при следующем
              входе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              onClick={() => setShowChangeRoleDialog(false)}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={handleConfirmChangeRole}>
              Сменить роль
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {role && activeTab && onTabChange && (
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} role={role} />
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditProfileDialog}
        onOpenChange={setShowEditProfileDialog}
        onSuccess={() => {
          // Можно добавить toast уведомление об успешном обновлении
        }}
      />
    </div>
  )
}
