type FieldProps = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export const Field = ({ label, hint, error, children }: FieldProps) => {
  const errorText = error?.trim() ? error : undefined
  const hintText = !errorText ? hint : undefined
  const message = errorText ?? hintText ?? '\u00A0'
  const isEmpty = !errorText && !hintText
  const className = `text-xs mt-1 min-h-[16px] ${errorText ? 'text-destructive' : 'text-muted-foreground'}`

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-muted-foreground">{label}</label>
      {children}
      <p className={className} role={errorText ? 'alert' : undefined} aria-hidden={isEmpty}>
        {message}
      </p>
    </div>
  )
}

export default Field
