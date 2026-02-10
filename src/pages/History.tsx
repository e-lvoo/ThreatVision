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
import TimeRangeSelector from '@/components/history/TimeRangeSelector';
import SummaryStatsRow from '@/components/history/SummaryStatsRow';
import DetectionTrendsChart from '@/components/history/DetectionTrendsChart';
import ThreatTypeChart from '@/components/history/ThreatTypeChart';
import PerformanceGauges from '@/components/history/PerformanceGauges';
import TopSourceIPsTable from '@/components/history/TopSourceIPsTable';
import HourlyHeatmap from '@/components/history/HourlyHeatmap';
import ModelPerformanceChart from '@/components/history/ModelPerformanceChart';
import ExportOptions from '@/components/history/ExportOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const History = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [customRange, setCustomRange] = useState<DateRange>({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);

  // Generate data based on selected time range
  const timeSeriesData = useMemo(() => {
    switch (selectedRange) {
      case '24h':
        return generateTimeSeriesData(24);
      case '7d':
        return generateDailyData(7);
      case '30d':
        return generateDailyData(30);
      case 'custom':
        // For custom, default to 30 days if no range selected
        return generateDailyData(30);
      default:
        return generateDailyData(7);
    }
  }, [selectedRange]);

  const summary = useMemo(() => generateSummary(timeSeriesData), [timeSeriesData]);
  const modelPerformance = useMemo(() => {
    const days = selectedRange === '24h' ? 1 : selectedRange === '7d' ? 7 : 30;
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
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Data Updated',
        description: `Showing data for ${selectedRange === 'custom' ? 'custom range' : `last ${selectedRange}`}`,
      });
    }, 500);
  }, [selectedRange]);

  const handleDownloadChart = useCallback(() => {
    toast({
      title: 'Chart Downloaded',
      description: 'Detection trends chart saved as PNG',
    });
  }, []);

  const handleViewFullList = useCallback(() => {
    toast({
      title: 'Coming Soon',
      description: 'Full IP list view is under development',
    });
  }, []);

  const handleExportPDF = useCallback(() => {
    setTimeout(() => {
      toast({
        title: 'PDF Generated',
        description: 'Report downloaded successfully',
      });
    }, 1500);
  }, []);

  const handleExportCSV = useCallback(() => {
    setTimeout(() => {
      toast({
        title: 'CSV Generated',
        description: 'Data export downloaded successfully',
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
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Detection History & Analytics</h1>
        <p className="text-muted-foreground">Historical threat analysis and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          customRange={customRange}
          onRangeChange={handleRangeChange}
          onCustomRangeChange={handleCustomRangeChange}
          onApply={handleApply}
        />
      </div>

      {/* Summary Statistics */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <SummaryStatsRow summary={summary} />
      </div>

      {/* Detection Trends Chart */}
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <DetectionTrendsChart data={timeSeriesData} onDownload={handleDownloadChart} />
      </div>

      {/* Threat Distribution & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <ThreatTypeChart data={threatTypeDistribution} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <PerformanceGauges
            accuracy={currentMetrics.accuracy}
            precision={currentMetrics.precision}
            recall={currentMetrics.recall}
            f1Score={currentMetrics.f1Score}
            f1Trend={currentMetrics.f1Trend}
          />
        </div>
      </div>

      {/* Top Source IPs & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <TopSourceIPsTable data={topSourceIPs} onViewFullList={handleViewFullList} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '550ms' }}>
          <HourlyHeatmap data={heatmapData} />
        </div>
      </div>

      {/* Model Performance Over Time */}
      <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <ModelPerformanceChart data={modelPerformance} />
      </div>

      {/* Export Options */}
      <div className="animate-fade-in-up" style={{ animationDelay: '650ms' }}>
        <ExportOptions onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
      </div>
    </div>
  );
};

export default History;
