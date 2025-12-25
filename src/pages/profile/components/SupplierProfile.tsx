interface SupplierProfileProps {
  onSettings: () => void
}

export const SupplierProfile = (_props: SupplierProfileProps) => {
  void _props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Профиль поставщика</h1>
      </div>
    </div>
  )
}
