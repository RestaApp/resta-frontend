type FieldProps = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export const Field = ({ label, hint, error, children }: FieldProps) => {
  const errorText = error?.trim() ? error : undefined
  const hintText = !errorText ? hint : undefined
  const hasMessage = !!errorText || !!hintText
  const className = `text-xs mt-1 ${errorText ? 'text-destructive' : 'text-muted-foreground'}`

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-muted-foreground">{label}</label>
      {children}
      {hasMessage ? (
        <p className={className} role={errorText ? 'alert' : undefined}>
          {errorText ?? hintText}
        </p>
      ) : null}
    </div>
  )
}

export default Field
