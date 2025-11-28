interface ApplicationsScreenProps {
  onBack: () => void
}

export function ApplicationsScreen(props: ApplicationsScreenProps) {
  // Параметры зарезервированы для будущего использования
  void props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-4">Мои заявки</h1>
        <div className="text-center py-12 text-muted-foreground">
          <p>Список заявок будет здесь</p>
        </div>
      </div>
    </div>
  )
}
