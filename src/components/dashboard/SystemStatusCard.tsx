import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { SystemStatus } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface SystemStatusCardProps {
  status: SystemStatus;
}

const statusConfig: Record<SystemStatus, { 
  label: string; 
  icon: typeof CheckCircle; 
  color: string;
  bgColor: string;
  pulseColor: string;
}> = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    pulseColor: 'bg-green-500',
  },
  degraded: {
    label: 'Performance Degraded',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    pulseColor: 'bg-yellow-500',
  },
  outage: {
    label: 'System Outage',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    pulseColor: 'bg-red-500',
  },
};

const SystemStatusCard = ({ status }: SystemStatusCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'glass-card-hover rounded-xl p-5 border',
      status === 'operational' && 'border-green-500/20 from-green-500/10 to-green-500/5',
      status === 'degraded' && 'border-yellow-500/20 from-yellow-500/10 to-yellow-500/5',
      status === 'outage' && 'border-red-500/20 from-red-500/10 to-red-500/5'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg', config.bgColor)}>
          <Activity className={cn('h-5 w-5', config.color)} />
        </div>
        <div className="relative">
          <div className={cn('h-3 w-3 rounded-full', config.pulseColor)} />
          <div className={cn('absolute inset-0 h-3 w-3 rounded-full animate-ping', config.pulseColor, 'opacity-75')} />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">System Status</p>
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.color)} />
          <span className={cn('text-lg font-semibold', config.color)}>{config.label}</span>
        </div>
      </div>
      
      {/* Mini status indicators */}
      <div className="mt-4 flex items-center gap-4">
        {['API', 'Database', 'ML Models'].map((service, i) => (
          <div key={service} className="flex items-center gap-1.5">
            <div className={cn(
              'h-2 w-2 rounded-full',
              i === 0 || status === 'operational' ? 'bg-green-500' : 
              status === 'degraded' && i === 1 ? 'bg-yellow-500' : 'bg-green-500'
            )} />
            <span className="text-xs text-muted-foreground">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatusCard;
