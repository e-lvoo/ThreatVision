/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState, useMemo, useCallback, ReactNode } from 'react';
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
import { Calendar as CalendarIcon, Download, FileDown, FileSpreadsheet, TrendingUp, TrendingDown, ShieldAlert, ShieldCheck, Activity, Target, ExternalLink, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, PieChart, Pie, Cell, LineChart, Line, BarChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// 9 COMPONENTS INLINED: TimeRangeSelector, SummaryStatsRow, DetectionTrendsChart, ThreatTypeChart, PerformanceGauges, TopSourceIPsTable, HourlyHeatmap, ModelPerformanceChart, ExportOptions

// ===== INTERNAL COMPONENT: TimeRangeSelector =====
interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  customRange: DateRange;
  onRangeChange: (range: TimeRange) => void;
  onCustomRangeChange: (range: DateRange) => void;
  onApply: () => void;
}

const TimeRangeSelector = ({ selectedRange, customRange, onRangeChange, onCustomRangeChange, onApply }: TimeRangeSelectorProps) => {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const ranges: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "Last 24h" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "custom", label: "Custom" },
  ];
  return (
    <div className="glass-card rounded-xl p-4 border border-border/30">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <Button key={range.value} variant={selectedRange === range.value ? "default" : "outline"} size="sm" onClick={() => onRangeChange(range.value)} className={cn("transition-all duration-200", selectedRange === range.value && "shadow-lg shadow-primary/25")}>
              {range.label}
            </Button>
          ))}
        </div>
        {selectedRange === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-[140px] justify-start text-left font-normal", !customRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange.from ? format(customRange.from, "MMM dd, yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customRange.from || undefined} onSelect={(date) => { onCustomRangeChange({ ...customRange, from: date || null }); setIsFromOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-[140px] justify-start text-left font-normal", !customRange.to && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange.to ? format(customRange.to, "MMM dd, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customRange.to || undefined} onSelect={(date) => { onCustomRangeChange({ ...customRange, to: date || null }); setIsToOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        )}
        <Button onClick={onApply} size="sm" className="ml-auto">Apply</Button>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: SummaryStatsRow =====
interface SummaryStatsRowProps {
  summary: {
    total: number;
    malicious: number;
    benign: number;
    confidence: number;
  };
}

const SummaryStatsRow = ({ summary }: SummaryStatsRowProps) => {
  const stats = [
    { label: 'Total Detections', value: summary.total, icon: Target, trend: 12.5, trendUp: true },
    { label: 'Malicious', value: summary.malicious, icon: ShieldAlert, trend: 8.3, trendUp: true },
    { label: 'Benign', value: summary.benign, icon: ShieldCheck, trend: 5.1, trendUp: false },
    { label: 'Avg Confidence', value: `${summary.confidence}%`, icon: Activity, trend: 2.5, trendUp: true },
  ];
  
  const variantStyles: { [key: string]: string } = {
    'Total Detections': 'from-blue-500/90 to-cyan-500/90',
    'Malicious': 'from-red-500/90 to-pink-500/90',
    'Benign': 'from-green-500/90 to-emerald-500/90',
    'Avg Confidence': 'from-purple-500/90 to-indigo-500/90',
  };

  const iconStyles: { [key: string]: string } = {
    'Total Detections': 'text-blue-400',
    'Malicious': 'text-red-400',
    'Benign': 'text-green-400',
    'Avg Confidence': 'text-purple-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn("glass-card p-6 border border-border/30 backdrop-blur-md bg-gradient-to-br", variantStyles[stat.label])}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-white/70">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{stat.value.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-green-300" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-300" />
                )}
                <span className={cn("text-xs", stat.trendUp ? 'text-green-300' : 'text-red-300')}>
                  {stat.trendUp ? '+' : '-'}{stat.trend}%
                </span>
              </div>
            </div>
            <stat.icon className={cn("h-8 w-8", iconStyles[stat.label])} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ===== INTERNAL COMPONENT: DetectionTrendsChart =====
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground">{data.date}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface DetectionTrendsChartProps {
  data: any[];
  onDownload: () => void;
}

const DetectionTrendsChart = ({ data, onDownload }: DetectionTrendsChartProps) => {
  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Detection Trends</h3>
        <Button variant="ghost" size="sm" onClick={onDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="malicious-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="benign-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area type="monotone" dataKey="malicious" fill="url(#malicious-gradient)" stroke="#ef4444" name="Malicious" />
          <Area type="monotone" dataKey="benign" fill="url(#benign-gradient)" stroke="#10b981" name="Benign" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: ThreatTypeChart =====
interface ThreatTypeChartProps {
  data: any[];
}

const ThreatTypeChart = ({ data }: ThreatTypeChartProps) => {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];
  
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <h3 className="text-lg font-semibold text-foreground mb-4">Threat Type Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={100} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, idx) => (
          <div key={item.name} className="text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <p className="text-sm font-semibold text-foreground ml-5">{item.value} ({item.percentage}%)</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: GaugeChart + PerformanceGauges =====
interface GaugeChartProps {
  value: number;
  label: string;
  color: string;
}

const GaugeChart = ({ value, label, color }: GaugeChartProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full transform -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.35s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{value}%</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PerformanceGaugesProps {
  modelPerformance: any;
}

const PerformanceGauges = ({ modelPerformance }: PerformanceGaugesProps) => {
  const metrics = [
    { key: 'accuracy', label: 'Accuracy', color: '#06b6d4' },
    { key: 'precision', label: 'Precision', color: '#8b5cf6' },
    { key: 'recall', label: 'Recall', color: '#ec4899' },
    { key: 'f1Score', label: 'F1 Score', color: '#f59e0b' },
  ];

  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <h3 className="text-lg font-semibold text-foreground mb-8">Model Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <GaugeChart
            key={metric.key}
            value={Math.round(modelPerformance[metric.key] * 100)}
            label={metric.label}
            color={metric.color}
          />
        ))}
      </div>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: TopSourceIPsTable =====
interface TopSourceIPsTableProps {
  data: any[];
  onViewFullList: () => void;
}

const TopSourceIPsTable = ({ data, onViewFullList }: TopSourceIPsTableProps) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Top Source IPs</h3>
        <Button variant="ghost" size="sm" onClick={onViewFullList} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-foreground">{item.ip}</span>
            <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", item.maliciousPercentage > 50 ? "bg-red-500" : item.maliciousPercentage > 25 ? "bg-yellow-500" : "bg-green-500")}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: HourlyHeatmap =====
interface HourlyHeatmapProps {
  data: any;
}

const HourlyHeatmap = ({ data }: HourlyHeatmapProps) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/20';
    if (count < 5) return 'bg-blue-500/30';
    if (count < 15) return 'bg-blue-500/60';
    if (count < 30) return 'bg-blue-500/80';
    return 'bg-blue-500';
  };

  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <h3 className="text-lg font-semibold text-foreground mb-4">Detection Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 justify-end pb-8">
              {days.map((day) => (
                <div key={day} className="h-8 flex items-center text-xs text-muted-foreground w-8">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-0">
              <div className="flex gap-1 pb-2">
                {hours.map((hour) => (
                  <div key={hour} className="text-xs text-muted-foreground w-8 text-center">
                    {hour.split(':')[0]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {days.map((day, dayIdx) => (
                  <div key={day} className="flex gap-1">
                    {hours.map((hour, hourIdx) => {
                      const count = Math.floor(Math.random() * 35);
                      return (
                        <UITooltip key={`${dayIdx}-${hourIdx}`}>
                          <TooltipTrigger asChild>
                            <div className={cn("w-8 h-8 rounded-md cursor-pointer transition-all hover:ring-2 ring-offset-2 ring-offset-card ring-primary", getColor(count))} />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p>{day} {hour}: {count} detections</p>
                          </TooltipContent>
                        </UITooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6 ml-8">
            <span className="text-xs text-muted-foreground">Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ opacity: (i + 1) * 0.25, backgroundColor: '#3b82f6' }} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: ModelPerformanceChart =====
interface ModelPerformanceChartProps {
  data: any[];
}

const ModelPerformanceChart = ({ data }: ModelPerformanceChartProps) => {
  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={false} name="Accuracy" isAnimationActive={false} />
          <Line type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Precision" isAnimationActive={false} />
          <Line type="monotone" dataKey="recall" stroke="#ec4899" strokeWidth={2} dot={false} name="Recall" isAnimationActive={false} />
          <Line type="monotone" dataKey="f1Score" stroke="#f59e0b" strokeWidth={2} dot={false} name="F1 Score" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ===== INTERNAL COMPONENT: ExportOptions =====
interface ExportOptionsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const ExportOptions = ({ onExportPDF, onExportCSV }: ExportOptionsProps) => {
  return (
    <Card className="glass-card p-6 border border-border/30 backdrop-blur-md bg-card/30">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileDown className="h-5 w-5 text-primary" />
        Export Report
      </h3>
      <div className="flex gap-3">
        <Button onClick={onExportPDF} className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
          <FileDown className="h-4 w-4" />
          Export as PDF
        </Button>
        <Button onClick={onExportCSV} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </Button>
      </div>
    </Card>
  );
};

// ===== MAIN PAGE COMPONENT: History =====
const History = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7d");
  const [customRange, setCustomRange] = useState<DateRange>({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);

  const timeSeriesData = useMemo(() => {
    switch (selectedRange) {
      case "24h": return generateTimeSeriesData(24);
      case "7d": return generateDailyData(7);
      case "30d": return generateDailyData(30);
      default: return generateDailyData(7);
    }
  }, [selectedRange]);

  const summary = useMemo(() => generateSummary(timeSeriesData), [timeSeriesData]);
  const modelPerformance = useMemo(() => {
    const days = selectedRange === "24h" ? 1 : selectedRange === "7d" ? 7 : 30;
    return generateModelPerformance(days);
  }, [selectedRange]);

  const topSourceIPs = useMemo(() => generateTopSourceIPs(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const handleRangeChange = useCallback((range: TimeRange) => {
    setSelectedRange(range);
  }, []);

  const handleCustomRangeChange = useCallback((range: DateRange) => {
    setCustomRange(range);
  }, []);

  const handleApply = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Updated",
        description: `Showing data for ${selectedRange === "custom" ? "custom range" : `last ${selectedRange}`}`,
      });
    }, 500);
  }, [selectedRange]);

  const handleDownloadChart = useCallback(() => {
    toast({
      title: "Chart Downloaded",
      description: "Detection trends chart saved as PNG",
    });
  }, []);

  const handleViewFullList = useCallback(() => {
    toast({
      title: "Coming Soon",
      description: "Full IP list view is under development",
    });
  }, []);

  const handleExportPDF = useCallback(() => {
    setTimeout(() => {
      toast({
        title: "PDF Generated",
        description: "Report downloaded successfully",
      });
    }, 1500);
  }, []);

  const handleExportCSV = useCallback(() => {
    setTimeout(() => {
      toast({
        title: "CSV Generated",
        description: "Data export downloaded successfully",
      });
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 rounded-xl bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-muted/50" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-muted/50" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] rounded-xl bg-muted/50" />
          <Skeleton className="h-[350px] rounded-xl bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Detection History & Analytics</h1>
        <p className="text-muted-foreground">Historical threat analysis and performance metrics</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          customRange={customRange}
          onRangeChange={handleRangeChange}
          onCustomRangeChange={handleCustomRangeChange}
          onApply={handleApply}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <SummaryStatsRow summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <DetectionTrendsChart data={timeSeriesData} onDownload={handleDownloadChart} />
        <ThreatTypeChart data={threatTypeDistribution} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <PerformanceGauges modelPerformance={modelPerformance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <TopSourceIPsTable data={topSourceIPs} onViewFullList={handleViewFullList} />
        <HourlyHeatmap data={heatmapData} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <ModelPerformanceChart data={modelPerformance.timeline} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <ExportOptions onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
      </div>
    </div>
  );
};

export default History;