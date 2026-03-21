import { 
  DetectionSummary, 
  TimeSeriesDataPoint, 
  ThreatTypeDistribution, 
  ModelPerformanceMetrics, 
  SourceIPData, 
  HeatmapCell 
} from '@/types/history';
import { subDays, subHours, format, getDay, getHours } from 'date-fns';

// Generate random number within range
const randomBetween = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate time series data
export const generateTimeSeriesData = (hours: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const date = subHours(now, i);
    const hour = getHours(date);
    
    // Simulate higher activity during business hours
    const activityMultiplier = hour >= 9 && hour <= 18 ? 1.5 : 0.7;
    
    const malicious = Math.floor(randomBetween(5, 30) * activityMultiplier);
    const benign = Math.floor(randomBetween(20, 80) * activityMultiplier);
    
    data.push({
      timestamp: format(date, hours <= 24 ? 'HH:mm' : 'MMM dd'),
      date,
      malicious,
      benign,
      total: malicious + benign,
    });
  }
  
  return data;
};

// Generate daily time series for 7/30 day views
export const generateDailyData = (days: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const dayOfWeek = getDay(date);
    
    // Simulate lower activity on weekends
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
    
    const malicious = Math.floor(randomBetween(50, 200) * weekendMultiplier);
    const benign = Math.floor(randomBetween(200, 600) * weekendMultiplier);
    
    data.push({
      timestamp: format(date, 'MMM dd'),
      date,
      malicious,
      benign,
      total: malicious + benign,
    });
  }
  
  return data;
};

// Summary statistics
export const generateSummary = (timeSeriesData: TimeSeriesDataPoint[]): DetectionSummary => {
  const totalDetections = timeSeriesData.reduce((sum, d) => sum + d.total, 0);
  const maliciousDetections = timeSeriesData.reduce((sum, d) => sum + d.malicious, 0);
  const benignDetections = timeSeriesData.reduce((sum, d) => sum + d.benign, 0);
  
  return {
    totalDetections,
    maliciousDetections,
    benignDetections,
    averageConfidence: randomBetween(85, 98),
    previousPeriodTotal: Math.floor(totalDetections * (0.8 + Math.random() * 0.4)),
    previousPeriodMalicious: Math.floor(maliciousDetections * (0.8 + Math.random() * 0.4)),
  };
};

// Threat type distribution
export const threatTypeDistribution: ThreatTypeDistribution[] = [
  { name: 'Trojan', value: 342, color: 'hsl(0, 84%, 60%)', percentage: 0 },
  { name: 'Virus', value: 256, color: 'hsl(25, 95%, 53%)', percentage: 0 },
  { name: 'Worm', value: 189, color: 'hsl(45, 93%, 47%)', percentage: 0 },
  { name: 'Ransomware', value: 145, color: 'hsl(270, 60%, 50%)', percentage: 0 },
  { name: 'Spyware', value: 98, color: 'hsl(200, 98%, 39%)', percentage: 0 },
  { name: 'Adware', value: 67, color: 'hsl(330, 80%, 60%)', percentage: 0 },
  { name: 'Other', value: 45, color: 'hsl(186, 100%, 50%)', percentage: 0 },
].map((item, _, arr) => {
  const total = arr.reduce((sum, i) => sum + i.value, 0);
  return { ...item, percentage: Math.round((item.value / total) * 100) };
});

// Model performance metrics over time
export const generateModelPerformance = (days: number): ModelPerformanceMetrics[] => {
  const data: ModelPerformanceMetrics[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    
    // Simulate gradual improvement with some variation
    const baseAccuracy = 92 + (days - i) * 0.05;
    
    data.push({
      accuracy: Math.min(99, baseAccuracy + randomBetween(-2, 2)),
      precision: Math.min(99, baseAccuracy - 1 + randomBetween(-3, 3)),
      recall: Math.min(99, baseAccuracy - 2 + randomBetween(-3, 3)),
      f1Score: Math.min(99, baseAccuracy - 1.5 + randomBetween(-2, 2)),
      timestamp: format(date, 'MMM dd'),
      date,
    });
  }
  
  return data;
};

// Top source IPs
export const generateTopSourceIPs = (): SourceIPData[] => {
  const ips = [
    '192.168.1.105', '10.0.0.45', '172.16.0.23', '192.168.2.87',
    '10.0.1.156', '172.16.1.89', '192.168.0.201', '10.0.2.34',
    '172.16.2.167', '192.168.3.42'
  ];
  
  return ips.map((ip, index) => ({
    ip,
    detectionsCount: randomBetween(50, 500) - index * 30,
    maliciousPercentage: randomBetween(10, 85),
    lastSeen: subHours(new Date(), randomBetween(0, 72)),
  })).sort((a, b) => b.detectionsCount - a.detectionsCount);
};

// Hourly heatmap data
export const generateHeatmapData = (): HeatmapCell[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data: HeatmapCell[] = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Simulate patterns: higher during weekday business hours
      let baseValue = 10;
      
      if (day >= 1 && day <= 5) { // Weekdays
        if (hour >= 9 && hour <= 17) {
          baseValue = 80;
        } else if (hour >= 6 && hour <= 22) {
          baseValue = 40;
        }
      } else { // Weekends
        baseValue = hour >= 10 && hour <= 20 ? 25 : 10;
      }
      
      data.push({
        day,
        hour,
        value: baseValue + randomBetween(-10, 20),
        dayName: days[day],
      });
    }
  }
  
  return data;
};

// Current performance metrics for gauges
export const currentMetrics = {
  accuracy: 96.4,
  precision: 94.8,
  recall: 93.2,
  f1Score: 94.0,
  f1Trend: 2.3,
};
