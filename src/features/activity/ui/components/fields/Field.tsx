
type FieldProps = {
    label: string
    hint?: string
    children: React.ReactNode
}

export const Field = ({ label, hint, children }: FieldProps) => (
    <div>
        <label className="block mb-2 text-sm text-muted-foreground">{label}</label>
        {children}
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
)

export default Field


