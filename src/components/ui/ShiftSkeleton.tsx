export const ShiftSkeleton = () => (
    <div className="bg-card rounded-[20px] p-4 border border-border/50 space-y-4 animate-pulse">
        <div className="flex justify-between">
            <div className="flex gap-3">
                <div className="w-12 h-12 bg-secondary rounded-2xl" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-secondary rounded" />
                    <div className="h-3 w-20 bg-secondary rounded" />
                </div>
            </div>
            <div className="h-6 w-16 bg-secondary rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-secondary rounded-xl" />
            <div className="h-8 bg-secondary rounded-xl" />
        </div>
        <div className="h-10 w-full bg-secondary rounded-xl" />
    </div>
)