/**
 * Главная страница приложения
 */

import { WorkerHome } from './components/WorkerHome'
import { VenueHome } from './components/VenueHome'
import { SupplierHome } from './components/SupplierHome'
import { isEmployeeRole } from '../../utils/roles'
import type { UserRole, Screen } from '../../types'

interface HomeProps {
  role: UserRole | null
  onNavigate: (destination: Screen) => void
}

export function Home({ role, onNavigate }: HomeProps) {
  if (!role) {
    return null
  }

  if (isEmployeeRole(role)) {
    return <WorkerHome onNavigate={onNavigate} role={role} />
  }

  if (role === 'venue') {
    return <VenueHome onNavigate={onNavigate} />
  }

  if (role === 'supplier') {
    return <SupplierHome onNavigate={onNavigate} />
  }

  return null
}





