import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "warning" | "danger" | "success";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const borderColors = {
    default: "border-slate-200 dark:border-slate-800",
    warning: "border-amber-400/60 dark:border-amber-600/60",
    danger: "border-rose-400/80 dark:border-rose-600/80",
    success: "border-emerald-400/60 dark:border-emerald-600/60",
  };

  return (
    <Card className={cn("p-5 transition-shadow hover:shadow-md", borderColors[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs space-x-2">
          {trend && (
            <span
              className={cn(
                "font-semibold",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
