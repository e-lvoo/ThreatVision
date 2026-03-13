import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  suffix?: string;
}

const variantConfig = {
  default: {
    card: 'border-border/60',
    icon: 'text-primary bg-primary/10',
    accent: 'bg-primary',
  },
  success: {
    card: 'border-border/60',
    icon: 'text-emerald-500 bg-emerald-500/10',
    accent: 'bg-emerald-500',
  },
  warning: {
    card: 'border-border/60',
    icon: 'text-amber-500 bg-amber-500/10',
    accent: 'bg-amber-500',
  },
  danger: {
    card: 'border-border/60',
    icon: 'text-red-500 bg-red-500/10',
    accent: 'bg-red-500',
  },
};

const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  suffix,
}: KPICardProps) => {
  const config = variantConfig[variant];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md',
        config.card
      )}
    >
      {/* Accent line */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5', config.accent)} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className={cn('p-2 rounded-lg', config.icon)}>
          <Icon className="h-4 w-4" />
        </div>

        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {suffix && (
          <span className="text-base text-muted-foreground">{suffix}</span>
        )}
      </div>

      {/* Title + trend label */}
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      {trendLabel && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">{trendLabel}</p>
      )}
    </div>
  );
};

export default KPICard;