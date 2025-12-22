import { useState, useCallback, useMemo } from 'react'
import { EditProfileDialog } from './components/EditProfileDialog'
import { getEmployeePositionLabel, getSpecializationLabel } from '../../constants/labels'
import {
  Edit,
  Star,
  Award,
  Briefcase,
  Settings,
  Bell,
  HelpCircle,
  Plus,
  PlusCircle,
  UserCircle,
  Mail,
  Phone,
  MapPin,
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
import { EmployeeSubRoleSelector } from '../RoleSelector/components/SubRoles/EmployeeSubRoleSelector'
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
  onTabChange?: (tab: Tab) => void
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

  // Получаем специализации напрямую из профиля (без запроса к API)
  // Запрос к API будет только при открытии диалога редактирования
  const specializationLabels = useMemo(() => {
    const userSpecializations = userProfile?.employee_profile?.specializations || []
    // Маппим значения на русские названия из labels.ts
    return userSpecializations.map(specValue => getSpecializationLabel(specValue))
  }, [userProfile?.employee_profile?.specializations])

  // Используем данные из API или значения по умолчанию
  const profile = {
    name: userProfile?.full_name || userProfile?.name || (isRestaurant ? 'Ресторан' : isSupplier ? 'Поставщик' : 'Пользователь'),
    role: role ? ROLE_LABELS[role] : userProfile?.role || 'Не указано',
    position: userProfile?.position || userProfile?.employee_profile?.position || null,
    specializations: specializationLabels,
    rating: userProfile?.average_rating || 0,
    reviewCount: userProfile?.total_reviews || 0,
    shiftsCompleted: isRestaurant ? 124 : 47, // TODO: получить из API
    experience: userProfile?.employee_profile?.experience_years ? `${userProfile.employee_profile.experience_years} ${userProfile.employee_profile.experience_years === 1 ? 'год' : userProfile.employee_profile.experience_years < 5 ? 'года' : 'лет'}` : 'Не указано',
    certificates: userProfile?.certifications && userProfile.certifications.length > 0
      ? userProfile.certifications
      : [],
    bio: userProfile?.bio || null,
    email: userProfile?.email || null,
    phone: userProfile?.phone || null,
    location: userProfile?.location || null,
    workExperienceSummary: userProfile?.work_experience_summary || null,
    skills: userProfile?.employee_profile?.skills || [],
    openToWork: userProfile?.employee_profile?.open_to_work || false,
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
      action: () => setShowEditProfileDialog(true),
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

      <div className="px-4 py-6 space-y-5">
        {/* Profile Header */}
        <Card className="p-6 shadow-md border border-border/50 bg-gradient-to-br from-card via-card to-card/95 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-5 mb-6">
            <Avatar className="w-28 h-28 ring-4 ring-primary/10 shadow-lg">
              <AvatarImage
                src={userProfile?.photo_url || userProfile?.profile_photo_url || null}
                alt={profile.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-3xl font-bold shadow-inner">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-bold mb-3 text-foreground leading-tight tracking-tight">{profile.name}</h1>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {profile.position && (
                  <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/40 bg-primary/10 hover:bg-primary/15 transition-colors">
                    {getEmployeePositionLabel(profile.position)}
                  </Badge>
                )}
                {profile.specializations && profile.specializations.length > 0 && (
                  <>
                    {profile.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs px-3 py-1.5 border-border/60 bg-muted/50 hover:bg-muted transition-colors">
                        {spec}
                      </Badge>
                    ))}
                  </>
                )}
                {(!profile.specializations || profile.specializations.length === 0) && isEmployee && (
                  <button
                    type="button"
                    className="h-8 w-8 p-0 rounded-full flex items-center justify-center hover:bg-primary/15 active:scale-95 transition-all duration-200 border-2 border-dashed border-primary/50 hover:border-primary/70"
                    onClick={() => setShowEditProfileDialog(true)}
                    aria-label="Добавить специализацию"
                  >
                    <PlusCircle className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className={`w-4 h-4 transition-colors ${profile.rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-foreground">
                    {profile.rating > 0 ? profile.rating.toFixed(1) : 'Нет рейтинга'}
                  </span>
                </div>
                {profile.reviewCount > 0 && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground">
                      {profile.reviewCount} {profile.reviewCount === 1 ? 'отзыв' : profile.reviewCount < 5 ? 'отзыва' : 'отзывов'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all duration-200 font-medium"
            onClick={() => setShowEditProfileDialog(true)}
          >
            <Edit className="w-4 h-4" />
            <span>Редактировать профиль</span>
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-5 text-center border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 hover:scale-[1.02] active:scale-[0.98] cursor-default">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center shadow-md ring-2 ring-primary/5">
              <Briefcase className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2 leading-tight min-h-[36px] flex items-center justify-center">
              {profile.shiftsCompleted}
            </div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Смен</div>
          </Card>
          <Card className="p-5 text-center border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 hover:scale-[1.02] active:scale-[0.98] cursor-default">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center shadow-md ring-2 ring-primary/5">
              <Award className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2 leading-tight min-h-[36px] flex items-center justify-center">
              {profile.experience === 'Не указано' ? (
                <span className="text-xl text-muted-foreground/60">—</span>
              ) : (
                profile.experience
              )}
            </div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Опыт</div>
          </Card>
          <Card className="p-5 text-center border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 hover:scale-[1.02] active:scale-[0.98] cursor-default">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center shadow-md ring-2 ring-primary/5">
              <Star className={`w-6 h-6 transition-colors ${profile.rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-primary'}`} strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2 leading-tight min-h-[36px] flex items-center justify-center">
              {profile.rating > 0 ? (
                profile.rating.toFixed(1)
              ) : (
                <span className="text-xl text-muted-foreground/60">—</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Рейтинг</div>
          </Card>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-bold mb-4 text-foreground tracking-tight">О себе</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          </Card>
        )}

        {/* Contact Information */}
        {(profile.email || profile.phone || profile.location) && (
          <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-bold mb-5 text-foreground tracking-tight">Контактная информация</h2>
            <div className="space-y-4">
              {profile.email && (
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/10">
                    <Mail className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Email</div>
                    <div className="text-sm font-semibold text-foreground break-all">{profile.email}</div>
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/10">
                    <Phone className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Телефон</div>
                    <div className="text-sm font-semibold text-foreground">{profile.phone}</div>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/10">
                    <MapPin className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Местоположение</div>
                    <div className="text-sm font-semibold text-foreground">{profile.location}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Work Experience Summary */}
        {profile.workExperienceSummary && (
          <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <Briefcase className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Опыт работы</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.workExperienceSummary}</p>
          </Card>
        )}

        {/* Skills */}
        {isEmployee && profile.skills.length > 0 && (
          <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-bold mb-5 text-foreground tracking-tight">Навыки</h2>
            <div className="flex flex-wrap gap-2.5">
              {profile.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="px-3.5 py-2 text-sm border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/50 transition-all duration-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Certificates */}
        <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <Award className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Сертификаты</h2>
            </div>
            {profile.certificates.length > 0 && (
              <button
                onClick={() => setShowEditProfileDialog(true)}
                className="text-primary hover:text-primary/80 active:scale-95 text-xs font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-primary/10"
              >
                Добавить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {profile.certificates.length > 0 ? (
              profile.certificates.map((cert: string, index: number) => (
                <Badge key={index} variant="outline" className="gap-2 px-3.5 py-2 border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/50 transition-all duration-200">
                  <Award className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="text-sm font-medium">{cert}</span>
                </Badge>
              ))
            ) : (
              <div className="w-full py-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground mb-4 font-medium">Сертификаты не добавлены</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all duration-200"
                  onClick={() => setShowEditProfileDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить сертификат</span>
                </Button>
              </div>
            )}
            {profile.certificates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all duration-200"
                onClick={() => setShowEditProfileDialog(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="p-2 border border-border/50 shadow-sm">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index}>
                <button
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-primary/5 active:bg-primary/10 rounded-xl transition-all duration-200 min-h-[60px] group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 group-hover:from-primary/20 group-hover:to-primary/15 flex items-center justify-center transition-all duration-200 shadow-sm ring-1 ring-primary/10 group-hover:shadow-md">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{item.label}</span>
                  <span className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 text-lg font-light">›</span>
                </button>
                {index < menuItems.length - 1 && <Separator className="my-1 mx-2" />}
              </div>
            )
          })}
        </Card>

        {/* For Restaurants */}
        {isRestaurant && (
          <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Быстрые действия</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Создайте вакансию и найдите квалифицированных специалистов
            </p>
            <Button className="w-full h-12 font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200" onClick={() => onNavigate(ROUTES.CREATE_SHIFT)}>
              Создать вакансию
            </Button>
          </Card>
        )}

        {/* For Suppliers */}
        {isSupplier && (
          <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Для поставщиков</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Управляйте каталогом товаров и находите новых клиентов
            </p>
            <Button className="w-full h-12 font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200" onClick={() => handleToast('Скоро будет доступно')}>
              Каталог товаров
            </Button>
          </Card>
        )}

      </div>

      {/* Change Role Dialog */}
      <AlertDialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <AlertDialogContent className="max-w-[340px] rounded-3xl shadow-2xl border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Сменить роль?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Вы уверены, что хотите сменить роль? Вам нужно будет выбрать новую роль при следующем
              входе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl h-11 font-semibold border-2"
              onClick={() => setShowChangeRoleDialog(false)}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-xl h-11 font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200" onClick={handleConfirmChangeRole}>
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
