import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChefHat } from 'lucide-react'
import { LogoWithText } from '@/components/ui/logo-with-text'

export const LoadingPage = memo(function LoadingPage() {
  const { t } = useTranslation()
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
        subtitle={t('loadingPage.subtitle')}
        iconClassName="mb-6"
      />
    </div>
  )
})
