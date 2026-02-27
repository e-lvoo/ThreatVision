/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Target, Activity, TrendingUp, TrendingDown, CheckCircle, AlertTriangleIcon, XCircle, ChevronLeft, ChevronRight, Eye, Check } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockKPIData, mockTimelineData, mockAlerts, mockThreatTypes } from '@/data/mockData';
import { Alert, SystemStatus, ThreatTypeData, TimelineDataPoint } from '@/types/dashboard';
import { format } from 'date-fns';

// ===== INTERNAL COMPONENT: KPICard =====
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
      <div className={cn('absolute inset-x-0 top-0 h-0.5', config.accent)} />
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
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {suffix && (
          <span className="text-base text-muted-foreground">{suffix}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      {trendLabel && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">{trendLabel}</p>
      )}
    </div>
  );
};

// ===== INTERNAL COMPONENT: AlertTimelineChart =====
interface AlertTimelineChartProps {
  data: TimelineDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-border/50">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AlertTimelineChart = ({ data }: AlertTimelineChartProps) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Alert Timeline</h3>
        <p className="text-sm text-muted-foreground">Alerts over the last 7 days by severity</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-muted-foreground capitalize">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorCritical)"
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#colorHigh)"
            />
            <Area
              type="monotone"
              dataKey="medium"
              stroke="#eab308"
              strokeWidth={2}
              fill="url(#colorMedium)"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorLow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: AlertsTable =====
const ITEMS_PER_PAGE = 10;

const severityStyles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusStyles = {
  open: 'bg-red-500/20 text-red-400',
  acknowledged: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
};

interface AlertsTableProps {
  alerts: Alert[];
  onViewDetails?: (alert: Alert) => void;
  onAcknowledge?: (alert: Alert) => void;
}

const AlertsTableComponent = ({ alerts, onViewDetails, onAcknowledge }: AlertsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAlerts = alerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="glass-card rounded-xl border border-border/30">
      <div className="p-5 border-b border-border/30">
        <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">Latest security alerts requiring attention</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Source IP</TableHead>
              <TableHead className="text-muted-foreground">Threat Type</TableHead>
              <TableHead className="text-muted-foreground">Severity</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow 
                key={alert.id} 
                className="border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(alert.timestamp, 'MMM dd, HH:mm:ss')}
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground">
                  {alert.sourceIp}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {alert.threatType}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn('capitalize border', (severityStyles as any)[alert.severity])}
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={cn('capitalize', (statusStyles as any)[alert.status])}
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(alert)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {alert.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAcknowledge?.(alert)}
                        className="text-yellow-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Ack
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-border/30 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, alerts.length)} of {alerts.length} alerts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: TopThreatsWidget =====
interface TopThreatsWidgetProps {
  data: ThreatTypeData[];
  onThreatClick?: (threatName: string) => void;
}

const threatColors = [
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
];

const TopThreatsWidget = ({ data, onThreatClick }: TopThreatsWidgetProps) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Threats</h3>
        <p className="text-sm text-muted-foreground">Most common threat types detected</p>
      </div>
      
      <div className="space-y-4">
        {data.map((threat, index) => (
          <button
            key={threat.name}
            onClick={() => onThreatClick?.(threat.name)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {threat.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{threat.count}</span>
                <span className="text-xs text-muted-foreground">({threat.percentage}%)</span>
              </div>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500 group-hover:opacity-80',
                  threatColors[index % threatColors.length]
                )}
                style={{ width: `${(threat.count / maxCount) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: SystemStatusCard =====
interface SystemStatusCardProps {
  status: SystemStatus;
}

const statusConfig = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle,
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-500',
    dot: 'bg-emerald-500',
    accent: 'bg-emerald-500',
    serviceStatus: ['operational', 'operational', 'operational'] as const,
  },
  degraded: {
    label: 'Performance Degraded',
    icon: AlertTriangleIcon,
    text: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-500',
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
    serviceStatus: ['operational', 'degraded', 'operational'] as const,
  },
  outage: {
    label: 'System Outage',
    icon: XCircle,
    text: 'text-red-500',
    badge: 'bg-red-500/10 text-red-500',
    dot: 'bg-red-500',
    accent: 'bg-red-500',
    serviceStatus: ['outage', 'outage', 'degraded'] as const,
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
      <div className={cn('absolute inset-x-0 top-0 h-0.5', config.accent)} />
      <div className="flex items-center justify-between mb-5">
        <div className="p-2 rounded-lg bg-muted">
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="relative flex items-center justify-center h-5 w-5">
          <div className={cn('h-2.5 w-2.5 rounded-full z-10', config.dot)} />
          <div className={cn('absolute h-2.5 w-2.5 rounded-full animate-ping opacity-50', config.dot)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">System Status</p>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4 shrink-0', config.text)} />
        <span className={cn('text-base font-semibold', config.text)}>{config.label}</span>
      </div>
      <div className="my-4 border-t border-border/40" />
      <div className="flex items-center gap-4">
        {services.map((service, i) => (
          <div key={service} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', (serviceDotColor as any)[config.serviceStatus[i]])} />
            <span className="text-xs text-muted-foreground">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== MAIN PAGE COMPONENT =====
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = (alert: Alert) => {
    console.log('View details:', alert);
  };

  const handleAcknowledge = (alert: Alert) => {
    setAlerts(prev => 
      prev.map(a => 
        a.id === alert.id ? { ...a, status: 'acknowledged' as const } : a
      )
    );
  };

  const handleThreatClick = (threatName: string) => {
    console.log('Filter by threat:', threatName);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl bg-muted/50" />
            ))}
          </div>
          <Skeleton className="h-[380px] rounded-xl bg-muted/50" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] rounded-xl bg-muted/50 lg:col-span-2" />
            <Skeleton className="h-[400px] rounded-xl bg-muted/50" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
          <p className="text-muted-foreground">Real-time threat monitoring and analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <KPICard
              title="Total Alerts"
              value={mockKPIData.totalAlerts.toLocaleString()}
              icon={AlertTriangle}
              trend={mockKPIData.alertsTrend}
              trendLabel="vs last week"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <KPICard
              title="Active Threats"
              value={mockKPIData.activeThreats}
              icon={Target}
              variant="danger"
              trendLabel="Requiring attention"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <KPICard
              title="Detection Accuracy"
              value={mockKPIData.detectionAccuracy}
              suffix="%"
              icon={Shield}
              variant="success"
              trendLabel="AI model performance"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <SystemStatusCard status={mockKPIData.systemStatus} />
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <AlertTimelineChart data={mockTimelineData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <AlertsTableComponent
              alerts={alerts}
              onViewDetails={handleViewDetails}
              onAcknowledge={handleAcknowledge}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <TopThreatsWidget
              data={mockThreatTypes}
              onThreatClick={handleThreatClick}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
