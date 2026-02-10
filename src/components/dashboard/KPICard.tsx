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

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  variant = 'default',
  suffix
}: KPICardProps) => {
  const variantStyles = {
    default: 'from-primary/20 to-primary/5 border-primary/20',
    success: 'from-green-500/20 to-green-500/5 border-green-500/20',
    warning: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20',
    danger: 'from-red-500/20 to-red-500/5 border-red-500/20',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-green-400 bg-green-500/10',
    warning: 'text-yellow-400 bg-yellow-500/10',
    danger: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className={cn(
      'glass-card-hover rounded-xl p-5 bg-gradient-to-br border',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
        </div>
        {trendLabel && (
          <p className="text-xs text-muted-foreground">{trendLabel}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
