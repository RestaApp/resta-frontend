interface SuppliersScreenProps {
  onBack: () => void
}

export function SuppliersScreen(_props: SuppliersScreenProps) {
  void _props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Поставщики</h1>
      </div>
    </div>
  )
}
