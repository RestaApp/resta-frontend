import { memo } from 'react'
import { ChefHat } from 'lucide-react'
import { LogoWithText } from '../../../../components/ui/LogoWithText'

export const LoadingPage = memo(function LoadingPage() {
  const logoIcon = (
    <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
      <ChefHat className="w-14 h-14 text-white" strokeWidth={1.5} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <LogoWithText
        icon={logoIcon}
        title="Resta"
        subtitle="Экосистема HoReCa в твоем кармане"
        iconClassName="mb-6"
      />
    </div>
  )
})
