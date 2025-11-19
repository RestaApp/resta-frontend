interface SettingsScreenProps {
  onBack: () => void
}

export function SettingsScreen(_props: SettingsScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-4">Настройки</h1>
        <div className="text-center py-12 text-muted-foreground">
          <p>Настройки будут здесь</p>
        </div>
      </div>
    </div>
  )
}
