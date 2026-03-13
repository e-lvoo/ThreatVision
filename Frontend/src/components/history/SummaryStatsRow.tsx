import { TrendingUp, TrendingDown, ShieldAlert, ShieldCheck, Activity, Target } from 'lucide-react';
import { DetectionSummary } from '@/types/history';
import { cn } from '@/lib/utils';

interface SummaryStatsRowProps {
  summary: DetectionSummary;
}

const SummaryStatsRow = ({ summary }: SummaryStatsRowProps) => {
  const totalChange = ((summary.totalDetections - summary.previousPeriodTotal) / summary.previousPeriodTotal) * 100;
  const maliciousChange = ((summary.maliciousDetections - summary.previousPeriodMalicious) / summary.previousPeriodMalicious) * 100;
  const maliciousPercentage = Math.round((summary.maliciousDetections / summary.totalDetections) * 100);
  const benignPercentage = 100 - maliciousPercentage;

  const stats = [
    {
      title: 'Total Detections',
      value: summary.totalDetections.toLocaleString(),
      icon: Activity,
      change: totalChange,
      changeLabel: 'vs last period',
      variant: 'default' as const,
    },
    {
      title: 'Malicious Detections',
      value: summary.maliciousDetections.toLocaleString(),
      icon: ShieldAlert,
      subtitle: `${maliciousPercentage}% of total`,
      change: maliciousChange,
      changeLabel: 'vs last period',
      variant: 'danger' as const,
    },
    {
      title: 'Benign Detections',
      value: summary.benignDetections.toLocaleString(),
      icon: ShieldCheck,
      subtitle: `${benignPercentage}% of total`,
      variant: 'success' as const,
    },
    {
      title: 'Avg Confidence Score',
      value: `${summary.averageConfidence}%`,
      icon: Target,
      subtitle: summary.averageConfidence >= 90 ? 'High confidence' : 'Moderate confidence',
      variant: summary.averageConfidence >= 90 ? 'success' as const : 'warning' as const,
    },
  ];

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className={cn(
            'glass-card-hover rounded-xl p-5 bg-gradient-to-br border animate-fade-in-up',
            variantStyles[stat.variant]
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn('p-2.5 rounded-lg', iconStyles[stat.variant])}>
              <stat.icon className="h-5 w-5" />
            </div>
            {stat.change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stat.change >= 0 ? 'text-red-400' : 'text-green-400'
              )}>
                {stat.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(stat.change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            )}
            {stat.changeLabel && stat.change !== undefined && (
              <p className="text-xs text-muted-foreground">{stat.changeLabel}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryStatsRow;
