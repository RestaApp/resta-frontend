import { memo } from 'react'

export const ShiftSkeleton = memo(function ShiftSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-[20px] border border-border/50 bg-card p-4">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="h-12 w-12 rounded-2xl bg-secondary" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-secondary" />
            <div className="h-3 w-20 rounded bg-secondary" />
          </div>
        </div>
        <div className="h-6 w-16 rounded bg-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 rounded-xl bg-secondary" />
        <div className="h-8 rounded-xl bg-secondary" />
      </div>

      <div className="h-10 w-full rounded-xl bg-secondary" />
    </div>
  )
})
