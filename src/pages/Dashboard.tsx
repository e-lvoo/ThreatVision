/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState, useEffect } from 'react';
import {
  AlertTriangle, Shield, Target, Activity,
  TrendingUp, TrendingDown, CheckCircle, AlertTriangleIcon,
  XCircle, ChevronLeft, ChevronRight, Eye, Check
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
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
  default: { icon: 'text-primary bg-primary/10', accent: 'bg-primary' },
  success: { icon: 'text-emerald-500 bg-emerald-500/10', accent: 'bg-emerald-500' },
  warning: { icon: 'text-amber-500 bg-amber-500/10', accent: 'bg-amber-500' },
  danger:  { icon: 'text-red-500 bg-red-500/10',    accent: 'bg-red-500' },
};

const KPICard = ({
  title, value, icon: Icon, trend, trendLabel, variant = 'default', suffix
}: KPICardProps) => {
  const config = variantConfig[variant];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md">
      <div className={cn('absolute inset-x-0 top-0 h-0.5', config.accent)} />

      <div className="flex items-center justify-between mb-5">
        <div className={cn('p-2 rounded-lg', config.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
        {suffix && <span className="text-base text-muted-foreground">{suffix}</span>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      {trendLabel && <p className="mt-0.5 text-xs text-muted-foreground/60">{trendLabel}</p>}
    </div>
  );
};


// ===== INTERNAL COMPONENT: SystemStatusCard =====
interface SystemStatusCardProps { status: SystemStatus; }

const statusConfig = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle,
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    accent: 'bg-emerald-500',
    serviceStatus: ['operational', 'operational', 'operational'] as const,
  },
  degraded: {
    label: 'Performance Degraded',
    icon: AlertTriangleIcon,
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
    serviceStatus: ['operational', 'degraded', 'operational'] as const,
  },
  outage: {
    label: 'System Outage',
    icon: XCircle,
    text: 'text-red-500',
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


// ===== INTERNAL COMPONENT: AlertTimelineChart =====
interface AlertTimelineChartProps { data: TimelineDataPoint[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CHART_SERIES = [
  { key: 'critical', color: '#ef4444', gradientId: 'colorCritical' },
  { key: 'high',     color: '#f97316', gradientId: 'colorHigh' },
  { key: 'medium',   color: '#eab308', gradientId: 'colorMedium' },
  { key: 'low',      color: '#3b82f6', gradientId: 'colorLow' },
];

const AlertTimelineChart = ({ data }: AlertTimelineChartProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">Alert Timeline</h3>
      <p className="text-sm text-muted-foreground">Alerts over the last 7 days by severity</p>
    </div>

    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            {CHART_SERIES.map(({ gradientId, color }) => (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="hsl(215 20% 65%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(215 20% 65%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(value) => (
              <span style={{ color: 'hsl(215 20% 65%)', textTransform: 'capitalize' }}>{value}</span>
            )}
          />
          {CHART_SERIES.map(({ key, color, gradientId }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);


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
    <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Top Threats</h3>
        <p className="text-sm text-muted-foreground">Most common threat types detected</p>
      </div>

      <div className="space-y-5">
        {data.map((threat, index) => (
          <button
            key={threat.name}
            onClick={() => onThreatClick?.(threat.name)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {threat.name}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-foreground">{threat.count}</span>
                <span className="text-xs text-muted-foreground">({threat.percentage}%)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500 group-hover:opacity-75',
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


// ===== INTERNAL COMPONENT: AlertsTable =====
const ITEMS_PER_PAGE = 10;

const severityStyles: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low:      'bg-blue-500/10 text-blue-500 border-blue-500/20',
  info:     'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const statusStyles: Record<string, string> = {
  open:         'bg-red-500/10 text-red-500',
  acknowledged: 'bg-amber-500/10 text-amber-500',
  resolved:     'bg-emerald-500/10 text-emerald-500',
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
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/40">
        <h3 className="text-base font-semibold text-foreground">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">Latest security alerts requiring attention</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent bg-muted/30">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Timestamp</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Source IP</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Threat Type</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Severity</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow
                key={alert.id}
                className="border-border/40 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-xs text-muted-foreground px-4 py-3">
                  {format(alert.timestamp, 'MMM dd, HH:mm:ss')}
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground px-4 py-3">
                  {alert.sourceIp}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground px-4 py-3">
                  {alert.threatType}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn('capitalize text-xs border rounded-full px-2 py-0.5', severityStyles[alert.severity])}
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={cn('capitalize text-xs rounded-full px-2 py-0.5', statusStyles[alert.status])}
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(alert)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                    {alert.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAcknowledge?.(alert)}
                        className="h-7 px-2 text-xs text-amber-500 hover:text-amber-500 hover:bg-amber-500/10"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
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

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, alerts.length)} of {alerts.length} alerts
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 rounded-lg border-border/60"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={cn(
                'h-7 w-7 p-0 rounded-lg text-xs',
                currentPage !== page && 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 rounded-lg border-border/60"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
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

  const handleViewDetails = (alert: Alert) => console.log('View details:', alert);
  const handleAcknowledge = (alert: Alert) =>
    setAlerts(prev => prev.map(a =>
      a.id === alert.id ? { ...a, status: 'acknowledged' as const } : a
    ));
  const handleThreatClick = (threatName: string) => console.log('Filter by threat:', threatName);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl bg-muted/50" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[380px] rounded-2xl bg-muted/50 lg:col-span-2" />
            <Skeleton className="h-[380px] rounded-2xl bg-muted/50" />
          </div>
          <Skeleton className="h-[420px] rounded-2xl bg-muted/50" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page header */}
        <div className="animate-fade-in">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Security Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time threat monitoring and analysis</p>
        </div>

        {/* Row 1 — KPI cards */}
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
          <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <KPICard
              title="Active Threats"
              value={mockKPIData.activeThreats}
              icon={Target}
              variant="danger"
              trendLabel="Requiring attention"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            <KPICard
              title="Detection Accuracy"
              value={mockKPIData.detectionAccuracy}
              suffix="%"
              icon={Shield}
              variant="success"
              trendLabel="AI model performance"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <SystemStatusCard status={mockKPIData.systemStatus} />
          </div>
        </div>

        {/* Row 2 — Chart (2/3) + Top Threats (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <AlertTimelineChart data={mockTimelineData} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <TopThreatsWidget
              data={mockThreatTypes}
              onThreatClick={handleThreatClick}
            />
          </div>
        </div>

        {/* Row 3 — Alerts table full width */}
        <div className="animate-fade-in-up" style={{ animationDelay: '480ms' }}>
          <AlertsTableComponent
            alerts={alerts}
            onViewDetails={handleViewDetails}
            onAcknowledge={handleAcknowledge}
          />
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;