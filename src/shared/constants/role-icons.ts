import type { LucideIcon } from 'lucide-react'
import {
  Bike,
  Box,
  Briefcase,
  Bug,
  ChefHat,
  CircleAlert,
  ClipboardList,
  Coffee,
  CreditCard,
  Fish,
  Flame,
  Hand,
  Headphones,
  HelpCircle,
  Leaf,
  Lock,
  Martini,
  Package,
  Shield,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  Truck,
  UserCog,
  UserRound,
  UtensilsCrossed,
  Wine,
  Wrench,
  Zap,
} from 'lucide-react'
import type { SupportTicketCategory } from '@/services/api/supportTicketsApi'
import type { EmployeeRole, RoleCategory, UiRole } from '@/shared/types/roles.types'

export const ICON_SM_CLASS = 'h-4 w-4 shrink-0 stroke-[1.5]'
export const ICON_MD_CLASS = 'h-5 w-5 shrink-0 stroke-[1.5]'

export const DEFAULT_ROLE_ICON: LucideIcon = UserRound

export const ROLE_ICONS: Record<UiRole, LucideIcon> = {
  chef: ChefHat,
  waiter: UtensilsCrossed,
  bartender: Martini,
  barista: Coffee,
  hostess: Hand,
  delivery: Bike,
  cashier: CreditCard,
  office: Briefcase,
  admin: UserCog,
  manager: ClipboardList,
  support: Headphones,
  venue: Store,
  supplier: Truck,
}

export const EMPLOYEE_ROLE_ICONS: Partial<Record<EmployeeRole, LucideIcon>> = ROLE_ICONS

export const SUPPLIER_CATEGORY_ICONS: Record<string, LucideIcon> = {
  products: Package,
  spices: Flame,
  herbs: Leaf,
  meat: UtensilsCrossed,
  fish: Fish,
  vegetables: Leaf,
  cheese: Package,
  alcohol: Wine,
  packaging: Box,
  equipment: Wrench,
  consumables: ShoppingBasket,
  services: Headphones,
  logistics: Truck,
}

export const SUPPORT_CATEGORY_ICONS: Record<SupportTicketCategory, LucideIcon> = {
  technical_issue: Bug,
  account_issue: CircleAlert,
  feature_request: Sparkles,
  general_inquiry: HelpCircle,
  onboarding_issue: Lock,
}

export const ROLE_CATEGORY_ICONS: Record<RoleCategory, LucideIcon> = {
  employee: Shield,
  restaurant: Zap,
  supplier: Star,
}

export const getRoleIcon = (role: UiRole): LucideIcon => ROLE_ICONS[role] ?? DEFAULT_ROLE_ICON

export const getEmployeeRoleIcon = (role: EmployeeRole): LucideIcon =>
  EMPLOYEE_ROLE_ICONS[role] ?? DEFAULT_ROLE_ICON

export const getSupplierCategoryIcon = (category: string): LucideIcon =>
  SUPPLIER_CATEGORY_ICONS[category] ?? Package
