/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState, useMemo, useCallback } from 'react';
import { TimeRange, DateRange } from '@/types/history';
import {
  generateTimeSeriesData,
  generateDailyData,
  generateSummary,
  threatTypeDistribution,
  generateModelPerformance,
  generateTopSourceIPs,
  generateHeatmapData,
  currentMetrics
} from '@/data/historyData';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Calendar as CalendarIcon, Download, FileDown, FileSpreadsheet,
  TrendingUp, TrendingDown, ShieldAlert, ShieldCheck,
  Activity, Target, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


// ===== SHARED: Chart Tooltip =====
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="text-xs text-muted-foreground mb-1.5">{payload[0]?.payload?.timestamp}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};


// ===== INTERNAL COMPONENT: TimeRangeSelector =====
interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  customRange: DateRange;
  onRangeChange: (range: TimeRange) => void;
  onCustomRangeChange: (range: DateRange) => void;
  onApply: () => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h',    label: 'Last 24h' },
  { value: '7d',     label: 'Last 7 days' },
  { value: '30d',    label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const TimeRangeSelector = ({ selectedRange, customRange, onRangeChange, onCustomRangeChange, onApply }: TimeRangeSelectorProps) => {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen]     = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Time Range</span>

        <div className="flex flex-wrap gap-1.5">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onRangeChange(range.value)}
              className={cn(
                'h-8 px-3 text-xs rounded-lg',
                selectedRange !== range.value && 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {selectedRange === 'custom' && (
          <div className="flex items-center gap-2">
            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('h-8 w-[140px] justify-start text-xs font-normal border-border/60', !customRange.from && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {customRange.from ? format(customRange.from, 'MMM dd, yyyy') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customRange.from || undefined}
                  onSelect={(date) => { onCustomRangeChange({ ...customRange, from: date || null }); setIsFromOpen(false); }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-xs text-muted-foreground">to</span>

            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('h-8 w-[140px] justify-start text-xs font-normal border-border/60', !customRange.to && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {customRange.to ? format(customRange.to, 'MMM dd, yyyy') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customRange.to || undefined}
                  onSelect={(date) => { onCustomRangeChange({ ...customRange, to: date || null }); setIsToOpen(false); }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Button onClick={onApply} size="sm" className="h-8 px-4 text-xs ml-auto">
          Apply
        </Button>
      </div>
    </div>
  );
};


// ===== INTERNAL COMPONENT: SummaryStatsRow =====
interface SummaryStatsRowProps {
  summary: {
    totalDetections: number;
    maliciousDetections: number;
    benignDetections: number;
    averageConfidence: number;
  };
}

const SUMMARY_STATS = [
  {
    key: 'totalDetections' as const,
    label: 'Total Detections',
    icon: Target,
    trend: 12.5,
    trendUp: true,
    accent: 'bg-blue-500',
    iconStyle: 'text-blue-500 bg-blue-500/10',
  },
  {
    key: 'maliciousDetections' as const,
    label: 'Malicious',
    icon: ShieldAlert,
    trend: 8.3,
    trendUp: true,
    accent: 'bg-red-500',
    iconStyle: 'text-red-500 bg-red-500/10',
  },
  {
    key: 'benignDetections' as const,
    label: 'Benign',
    icon: ShieldCheck,
    trend: 5.1,
    trendUp: false,
    accent: 'bg-emerald-500',
    iconStyle: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    key: 'averageConfidence' as const,
    label: 'Avg Confidence',
    icon: Activity,
    trend: 2.5,
    trendUp: true,
    accent: 'bg-purple-500',
    iconStyle: 'text-purple-500 bg-purple-500/10',
    suffix: '%',
  },
];

const SummaryStatsRow = ({ summary }: SummaryStatsRowProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {SUMMARY_STATS.map((stat) => {
      const Icon = stat.icon;
      const rawValue = summary[stat.key];
      const displayValue = stat.suffix
        ? `${rawValue}${stat.suffix}`
        : rawValue.toLocaleString();

      return (
        <div key={stat.key} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md">
          <div className={cn('absolute inset-x-0 top-0 h-0.5', stat.accent)} />

          <div className="flex items-center justify-between mb-5">
            <div className={cn('p-2 rounded-lg', stat.iconStyle)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            )}>
              {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stat.trend}%
            </span>
          </div>

          <div className="text-3xl font-semibold tracking-tight text-foreground">{displayValue}</div>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      );
    })}
  </div>
);


// ===== INTERNAL COMPONENT: DetectionTrendsChart =====
interface DetectionTrendsChartProps {
  data: any[];
  onDownload: () => void;
}

const DetectionTrendsChart = ({ data, onDownload }: DetectionTrendsChartProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Detection Trends</h3>
        <p className="text-sm text-muted-foreground">Malicious vs benign over time</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDownload} className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    </div>

    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-malicious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-benign" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(215 20% 65%)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(215 20% 65%)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(v) => <span style={{ color: 'hsl(215 20% 65%)' }}>{v}</span>}
          />
          <Area type="monotone" dataKey="malicious" fill="url(#grad-malicious)" stroke="#ef4444" strokeWidth={1.5} name="Malicious" />
          <Area type="monotone" dataKey="benign"    fill="url(#grad-benign)"    stroke="#10b981" strokeWidth={1.5} name="Benign" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);


// ===== INTERNAL COMPONENT: ThreatTypeChart =====
interface ThreatTypeChartProps { data: any[]; }

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];

const ThreatTypeChart = ({ data }: ThreatTypeChartProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">Threat Distribution</h3>
      <p className="text-sm text-muted-foreground">Breakdown by threat type</p>
    </div>

    <div className="flex flex-col items-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 w-full grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-muted-foreground truncate">{item.name}</span>
            </div>
            <span className="text-xs font-medium text-foreground ml-2 shrink-0">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);


// ===== INTERNAL COMPONENT: GaugeChart =====
interface GaugeChartProps { value: number; label: string; color: string; }

const GaugeChart = ({ value, label, color }: GaugeChartProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(217 33% 20%)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{Math.round(safeValue)}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};


// ===== INTERNAL COMPONENT: PerformanceGauges =====
interface PerformanceGaugesProps { modelPerformance: any; }

const GAUGE_METRICS = [
  { key: 'accuracy',  label: 'Accuracy',  color: '#06b6d4' },
  { key: 'precision', label: 'Precision', color: '#8b5cf6' },
  { key: 'recall',    label: 'Recall',    color: '#ec4899' },
  { key: 'f1Score',   label: 'F1 Score',  color: '#f59e0b' },
];

const PerformanceGauges = ({ modelPerformance }: PerformanceGaugesProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">Model Performance</h3>
      <p className="text-sm text-muted-foreground">Current detection model metrics</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {GAUGE_METRICS.map((m) => (
        <GaugeChart
          key={m.key}
          value={(currentMetrics[m.key as keyof typeof currentMetrics] ?? 0) * 100}
          label={m.label}
          color={m.color}
        />
      ))}
    </div>
  </div>
);


// ===== INTERNAL COMPONENT: TopSourceIPsTable =====
interface TopSourceIPsTableProps {
  data: any[];
  onViewFullList: () => void;
}

const TopSourceIPsTable = ({ data, onViewFullList }: TopSourceIPsTableProps) => {
  const maxCount = Math.max(...data.map(d => d.detectionsCount), 1);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Top Source IPs</h3>
          <p className="text-sm text-muted-foreground">Most active source addresses</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewFullList}
          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {data.slice(0, 5).map((item, i) => {
          const barColor =
            item.maliciousPercentage > 50 ? 'bg-red-500' :
            item.maliciousPercentage > 25 ? 'bg-amber-500' :
            'bg-emerald-500';

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-foreground">{item.ip}</span>
                <span className="text-xs text-muted-foreground">{item.detectionsCount}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${(item.detectionsCount / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ===== INTERNAL COMPONENT: HourlyHeatmap =====
interface HourlyHeatmapProps { data: any; }

const HEATMAP_DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

const getHeatColor = (count: number) => {
  if (count === 0)  return 'bg-muted/30';
  if (count < 5)    return 'bg-blue-500/20';
  if (count < 15)   return 'bg-blue-500/45';
  if (count < 30)   return 'bg-blue-500/70';
  return 'bg-blue-500';
};

const HourlyHeatmap = ({ data }: HourlyHeatmapProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">Detection Activity</h3>
      <p className="text-sm text-muted-foreground">Hourly activity heatmap by day</p>
    </div>

    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Hour labels */}
        <div className="flex gap-1 mb-1 ml-9">
          {HEATMAP_HOURS.map((h) => (
            <div key={h} className="w-7 text-center text-[10px] text-muted-foreground/60">{h}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {HEATMAP_DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1">
              <span className="w-8 text-xs text-muted-foreground shrink-0">{day}</span>
              {HEATMAP_HOURS.map((_, hourIdx) => {
                const count = Math.floor(Math.random() * 35);
                return (
                  <UITooltip key={`${dayIdx}-${hourIdx}`}>
                    <TooltipTrigger asChild>
                      <div className={cn('w-7 h-7 rounded cursor-pointer transition-opacity hover:opacity-80', getHeatColor(count))} />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {day} {hourIdx}:00 — {count} detections
                    </TooltipContent>
                  </UITooltip>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 ml-9">
          <span className="text-xs text-muted-foreground">Less</span>
          {[0.15, 0.3, 0.5, 0.7, 1].map((o, i) => (
            <div key={i} className="w-4 h-4 rounded-sm bg-blue-500" style={{ opacity: o }} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  </div>
);


// ===== INTERNAL COMPONENT: ModelPerformanceChart =====
interface ModelPerformanceChartProps { data: any[]; }

const PERF_LINES = [
  { key: 'accuracy',  color: '#06b6d4', label: 'Accuracy' },
  { key: 'precision', color: '#8b5cf6', label: 'Precision' },
  { key: 'recall',    color: '#ec4899', label: 'Recall' },
  { key: 'f1Score',   color: '#f59e0b', label: 'F1 Score' },
];

const ModelPerformanceChart = ({ data }: ModelPerformanceChartProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">Performance Over Time</h3>
      <p className="text-sm text-muted-foreground">Model metric trends across the selected period</p>
    </div>

    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(215 20% 65%)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(215 20% 65%)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(v) => <span style={{ color: 'hsl(215 20% 65%)' }}>{v}</span>}
          />
          {PERF_LINES.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              name={label}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);


// ===== INTERNAL COMPONENT: ExportOptions =====
interface ExportOptionsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const ExportOptions = ({ onExportPDF, onExportCSV }: ExportOptionsProps) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="p-2 rounded-lg bg-muted">
        <FileDown className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Export Report</h3>
        <p className="text-sm text-muted-foreground">Download data for the selected time range</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onExportPDF}
        size="sm"
        className="h-9 px-4 text-sm bg-red-600 hover:bg-red-700 text-white"
      >
        <FileDown className="h-3.5 w-3.5 mr-2" />
        Export as PDF
      </Button>
      <Button
        onClick={onExportCSV}
        variant="outline"
        size="sm"
        className="h-9 px-4 text-sm border-border/60"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
        Export as CSV
      </Button>
    </div>
  </div>
);


// ===== MAIN PAGE COMPONENT: History =====
const History = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [customRange, setCustomRange]     = useState<DateRange>({ from: null, to: null });
  const [isLoading, setIsLoading]         = useState(false);

  const timeSeriesData = useMemo(() => {
    switch (selectedRange) {
      case '24h': return generateTimeSeriesData(24);
      case '7d':  return generateDailyData(7);
      case '30d': return generateDailyData(30);
      default:    return generateDailyData(7);
    }
  }, [selectedRange]);

  const summary        = useMemo(() => generateSummary(timeSeriesData), [timeSeriesData]);
  const modelPerf      = useMemo(() => {
    const days = selectedRange === '24h' ? 1 : selectedRange === '7d' ? 7 : 30;
    return generateModelPerformance(days);
  }, [selectedRange]);
  const topSourceIPs   = useMemo(() => generateTopSourceIPs(), []);
  const heatmapData    = useMemo(() => generateHeatmapData(), []);

  const handleRangeChange       = useCallback((r: TimeRange) => setSelectedRange(r), []);
  const handleCustomRangeChange = useCallback((r: DateRange) => setCustomRange(r), []);

  const handleApply = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: 'Data Updated', description: `Showing data for ${selectedRange === 'custom' ? 'custom range' : `last ${selectedRange}`}` });
    }, 500);
  }, [selectedRange]);

  const handleDownloadChart = useCallback(() => {
    toast({ title: 'Chart Downloaded', description: 'Detection trends chart saved as PNG' });
  }, []);

  const handleViewFullList = useCallback(() => {
    toast({ title: 'Coming Soon', description: 'Full IP list view is under development' });
  }, []);

  const handleExportPDF = useCallback(() => {
    setTimeout(() => toast({ title: 'PDF Generated', description: 'Report downloaded successfully' }), 1500);
  }, []);

  const handleExportCSV = useCallback(() => {
    setTimeout(() => toast({ title: 'CSV Generated', description: 'Data export downloaded successfully' }), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-14 rounded-2xl bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl bg-muted/50" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[380px] rounded-2xl bg-muted/50" />
          <Skeleton className="h-[380px] rounded-2xl bg-muted/50" />
        </div>
        <Skeleton className="h-[220px] rounded-2xl bg-muted/50" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-2xl bg-muted/50" />
          <Skeleton className="h-[300px] rounded-2xl bg-muted/50" />
        </div>
        <Skeleton className="h-[360px] rounded-2xl bg-muted/50" />
        <Skeleton className="h-[130px] rounded-2xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-6">

      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Detection History & Analytics</h1>
        <p className="text-sm text-muted-foreground">Historical threat analysis and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          customRange={customRange}
          onRangeChange={handleRangeChange}
          onCustomRangeChange={handleCustomRangeChange}
          onApply={handleApply}
        />
      </div>

      {/* KPI Row */}
      <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <SummaryStatsRow summary={summary} />
      </div>

      {/* Detection Trends + Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <div className="lg:col-span-2">
          <DetectionTrendsChart data={timeSeriesData} onDownload={handleDownloadChart} />
        </div>
        <div>
          <ThreatTypeChart data={threatTypeDistribution} />
        </div>
      </div>

      {/* Model Performance Gauges — full width */}
      <div className="animate-fade-in-up" style={{ animationDelay: '320ms' }}>
        <PerformanceGauges modelPerformance={modelPerf} />
      </div>

      {/* Top Source IPs + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TopSourceIPsTable data={topSourceIPs} onViewFullList={handleViewFullList} />
        <HourlyHeatmap data={heatmapData} />
      </div>

      {/* Performance Over Time — full width */}
      <div className="animate-fade-in-up" style={{ animationDelay: '480ms' }}>
        <ModelPerformanceChart data={modelPerf} />
      </div>

      {/* Export */}
      <div className="animate-fade-in-up" style={{ animationDelay: '560ms' }}>
        <ExportOptions onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
      </div>

    </div>
  );
};

export default History;