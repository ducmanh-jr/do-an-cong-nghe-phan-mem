import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  gradient?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, gradient }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
          gradient ? gradient : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trendUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-current opacity-[0.03] pointer-events-none" />
    </div>
  );
}
