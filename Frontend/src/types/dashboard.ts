export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type SystemStatus = 'operational' | 'degraded' | 'outage';
export type ThreatCategory = 'virus' | 'trojan' | 'worm' | 'ransomware' | 'ddos' | 'phishing' | 'injection' | 'bruteforce';

export interface AlertNote {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  timestamp: Date;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS';
  threatType: string;
  threatCategory: ThreatCategory;
  severity: Severity;
  status: AlertStatus;
  description?: string;
  confidenceScore: number;
  packetCount: number;
  byteCount: number;
  modelUsed: string;
  detectionMethod: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notes?: AlertNote[];
}

export interface KPIData {
  totalAlerts: number;
  alertsTrend: number;
  activeThreats: number;
  detectionAccuracy: number;
  systemStatus: SystemStatus;
}

export interface TimelineDataPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ThreatTypeData {
  name: string;
  count: number;
  percentage: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst';
  avatar?: string;
}

export interface AlertFilters {
  search: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  severity: Severity | 'all';
  status: AlertStatus | 'all';
}
