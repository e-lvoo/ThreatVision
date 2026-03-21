import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { SystemStatus } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface SystemStatusCardProps {
  status: SystemStatus;
}

const statusConfig: Record<SystemStatus, {
  label: string;
  icon: typeof CheckCircle;
  text: string;
  badge: string;
  dot: string;
  accent: string;
  serviceStatus: ('operational' | 'degraded' | 'outage')[];
}> = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle,
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-500',
    dot: 'bg-emerald-500',
    accent: 'bg-emerald-500',
    serviceStatus: ['operational', 'operational', 'operational'],
  },
  degraded: {
    label: 'Performance Degraded',
    icon: AlertTriangle,
    text: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-500',
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
    serviceStatus: ['operational', 'degraded', 'operational'],
  },
  outage: {
    label: 'System Outage',
    icon: XCircle,
    text: 'text-red-500',
    badge: 'bg-red-500/10 text-red-500',
    dot: 'bg-red-500',
    accent: 'bg-red-500',
    serviceStatus: ['outage', 'outage', 'degraded'],
  },
};

const serviceDotColor = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  outage: 'bg-red-500',
};

const services = ['API', 'Database', 'ML Models'] as const;

const SystemStatusCard = ({ status }: SystemStatusCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md">
      {/* Accent line */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5', config.accent)} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="p-2 rounded-lg bg-muted">
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Pulse indicator */}
        <div className="relative flex items-center justify-center h-5 w-5">
          <div className={cn('h-2.5 w-2.5 rounded-full z-10', config.dot)} />
          <div className={cn('absolute h-2.5 w-2.5 rounded-full animate-ping opacity-50', config.dot)} />
        </div>
      </div>

      {/* Status */}
      <p className="text-sm text-muted-foreground mb-1">System Status</p>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4 shrink-0', config.text)} />
        <span className={cn('text-base font-semibold', config.text)}>{config.label}</span>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border/40" />

      {/* Service indicators */}
      <div className="flex items-center gap-4">
        {services.map((service, i) => (
          <div key={service} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', serviceDotColor[config.serviceStatus[i]])} />
            <span className="text-xs text-muted-foreground">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatusCard;