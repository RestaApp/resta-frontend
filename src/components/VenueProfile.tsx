interface VenueProfileProps {
  onSettings: () => void
}

export function VenueProfile(_props: VenueProfileProps) {
  void _props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Профиль заведения</h1>
      </div>
    </div>
  )
}
