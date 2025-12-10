import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
}

const StatsCard = ({ title, value, icon: Icon, description, trend }: StatsCardProps) => {
    return (
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                        {trend}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-white/60 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-white">{value}</p>
                {description && (
                    <p className="text-white/40 text-xs mt-1">{description}</p>
                )}
            </div>
        </div>
    )
}

export default StatsCard
