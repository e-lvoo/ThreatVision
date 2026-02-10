export interface DetectionSummary {
  totalDetections: number;
  maliciousDetections: number;
  benignDetections: number;
  averageConfidence: number;
  previousPeriodTotal: number;
  previousPeriodMalicious: number;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  date: Date;
  malicious: number;
  benign: number;
  total: number;
}

export interface ThreatTypeDistribution {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
  date: Date;
}

export interface SourceIPData {
  ip: string;
  detectionsCount: number;
  maliciousPercentage: number;
  lastSeen: Date;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
  dayName: string;
}

export type TimeRange = '24h' | '7d' | '30d' | 'custom';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}
