/**
 * Главная страница для поставщика
 */

import type { Screen } from '../../../types'

interface SupplierHomeProps {
  onNavigate: (destination: Screen) => void
}

export function SupplierHome(_props: SupplierHomeProps) {
  void _props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Добро пожаловать, Поставщик!</h1>
        <p className="text-muted-foreground">Управляйте товарами и услугами</p>
      </div>
    </div>
  )
}



