import { Star } from 'lucide-react'
import type { Job } from '../../Feed/types'

interface JobCardProps {
    job: Job
    onContact: (restaurant: string) => void
}

export const JobCard = ({ job, onContact }: JobCardProps) => {
    return (
        <div
            className="rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow backdrop-blur-xl bg-card"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-secondary/50 rounded-xl flex items-center justify-center border border-border/50">
                    <span className="text-2xl">{job.logo}</span>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground">{job.restaurant}</h3>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span className="text-muted-foreground">{job.rating}</span>
                        </div>
                    </div>
                    <h4 className="text-foreground">{job.position}</h4>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-muted-foreground">
                <span>График: {job.schedule}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-success">
                    <span className="mr-1">{job.salary}</span>
                    <span>{job.currency}/мес</span>
                </div>
                <button
                    onClick={() => onContact(job.restaurant)}
                    className="px-6 py-2 bg-card/60 text-muted-foreground rounded-xl hover:bg-card transition-colors border border-border"
                >
                    Показать контакты
                </button>
            </div>
        </div>
    )
}


