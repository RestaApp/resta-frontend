type FieldProps = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export const Field = ({ label, hint, error, children }: FieldProps) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-muted-foreground">{label}</label>
    {children}
    {error ? (
      <p className="text-xs text-destructive mt-1" role="alert">
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    ) : null}
  </div>
)

export default Field
