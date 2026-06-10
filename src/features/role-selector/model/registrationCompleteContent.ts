import {
  Bell,
  Building2,
  MessageCircle,
  Package,
  Plus,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { RoleCategory } from '@/shared/types/roles.types'

export interface RegistrationCompleteFeature {
  icon: LucideIcon
  textKey: string
}

export const REGISTRATION_COMPLETE_CONTENT: Record<
  RoleCategory,
  {
    subtitleKey: string
    ctaKey: string
    features: RegistrationCompleteFeature[]
  }
> = {
  employee: {
    subtitleKey: 'onboarding.complete.employee.subtitle',
    ctaKey: 'onboarding.complete.employee.cta',
    features: [
      { icon: Search, textKey: 'onboarding.complete.employee.features.search' },
      { icon: Bell, textKey: 'onboarding.complete.employee.features.notifications' },
      { icon: MessageCircle, textKey: 'onboarding.complete.employee.features.chat' },
    ],
  },
  restaurant: {
    subtitleKey: 'onboarding.complete.restaurant.subtitle',
    ctaKey: 'onboarding.complete.restaurant.cta',
    features: [
      { icon: Plus, textKey: 'onboarding.complete.restaurant.features.publish' },
      { icon: Users, textKey: 'onboarding.complete.restaurant.features.candidates' },
      { icon: MessageCircle, textKey: 'onboarding.complete.restaurant.features.chat' },
    ],
  },
  supplier: {
    subtitleKey: 'onboarding.complete.supplier.subtitle',
    ctaKey: 'onboarding.complete.supplier.cta',
    features: [
      { icon: Building2, textKey: 'onboarding.complete.supplier.features.venues' },
      { icon: Package, textKey: 'onboarding.complete.supplier.features.catalog' },
      { icon: MessageCircle, textKey: 'onboarding.complete.supplier.features.chat' },
    ],
  },
}
