import { cn } from "@/lib/utils";
import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
        className
      )}
    >
      {icon && (
        <div className="p-3 mb-4 rounded-2xl bg-amber-500/10 text-amber-500">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
