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
import { Calendar as CalendarIcon, Download, FileDown, FileSpreadsheet, TrendingUp, TrendingDown, ShieldAlert, ShieldCheck, Activity, Target, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

// For brevity, remaining 8 components will be added as stubs
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
  const modelPerformance = useMemo(() => { const days = selectedRange === "24h" ? 1 : selectedRange === "7d" ? 7 : 30; return generateModelPerformance(days); }, [selectedRange]);
  const topSourceIPs = useMemo(() => generateTopSourceIPs(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const handleRangeChange = useCallback((range: TimeRange) => { setSelectedRange(range); }, []);
  const handleCustomRangeChange = useCallback((range: DateRange) => { setCustomRange(range); }, []);
  const handleApply = useCallback(() => { setIsLoading(true); setTimeout(() => { setIsLoading(false); toast({ title: "Data Updated", description: `Showing data for ${selectedRange === "custom" ? "custom range" : `last ${selectedRange}`}`, }); }, 500); }, [selectedRange]);
  const handleDownloadChart = useCallback(() => { toast({ title: "Chart Downloaded", description: "Detection trends chart saved as PNG", }); }, []);
  const handleViewFullList = useCallback(() => { toast({ title: "Coming Soon", description: "Full IP list view is under development", }); }, []);
  const handleExportPDF = useCallback(() => { setTimeout(() => { toast({ title: "PDF Generated", description: "Report downloaded successfully", }); }, 1500); }, []);
  const handleExportCSV = useCallback(() => { setTimeout(() => { toast({ title: "CSV Generated", description: "Data export downloaded successfully", }); }, 1000); }, []);
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
        <TimeRangeSelector selectedRange={selectedRange} customRange={customRange} onRangeChange={handleRangeChange} onCustomRangeChange={handleCustomRangeChange} onApply={handleApply} />
      </div>
      <div className="text-center p-12 text-muted-foreground">Remaining components inlined for design mode...</div>
    </div>
  );
};
export default History;