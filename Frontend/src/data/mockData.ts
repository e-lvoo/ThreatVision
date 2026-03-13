import { KPIData, TimelineDataPoint, ThreatTypeData } from '@/types/dashboard';
import { mockAlertsData } from './alertsData';

export const mockKPIData: KPIData = {
  totalAlerts: 1247,
  alertsTrend: 12.5,
  activeThreats: 23,
  detectionAccuracy: 94.7,
  systemStatus: 'operational',
};

export const mockTimelineData: TimelineDataPoint[] = [
  { date: 'Mon', critical: 5, high: 12, medium: 28, low: 45 },
  { date: 'Tue', critical: 8, high: 15, medium: 32, low: 52 },
  { date: 'Wed', critical: 3, high: 10, medium: 25, low: 38 },
  { date: 'Thu', critical: 12, high: 22, medium: 45, low: 67 },
  { date: 'Fri', critical: 6, high: 18, medium: 35, low: 55 },
  { date: 'Sat', critical: 2, high: 8, medium: 18, low: 28 },
  { date: 'Sun', critical: 4, high: 11, medium: 22, low: 35 },
];

export const mockThreatTypes: ThreatTypeData[] = [
  { name: 'SQL Injection', count: 342, percentage: 27.4 },
  { name: 'DDoS Attack', count: 285, percentage: 22.9 },
  { name: 'Malware', count: 234, percentage: 18.8 },
  { name: 'Phishing', count: 198, percentage: 15.9 },
  { name: 'Brute Force', count: 188, percentage: 15.0 },
];

// Re-export for backwards compatibility
export const mockAlerts = mockAlertsData;
