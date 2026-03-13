export interface AlertRule {
  id: string;
  name: string;
  condition: 'ip' | 'threat_type' | 'confidence' | 'severity' | 'port';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  order: number;
}

export interface IPListItem {
  id: string;
  ip: string;
  addedBy: string;
  addedAt: Date;
  reason?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: Date;
  permissions: UserPermissions;
}

export interface UserPermissions {
  viewAlerts: boolean;
  acknowledgeAlerts: boolean;
  accessSettings: boolean;
  manageUsers: boolean;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: {
    alertCreated: boolean;
    alertAcknowledged: boolean;
    alertResolved: boolean;
  };
  enabled: boolean;
  lastTriggered?: Date;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'deploy';
  resource: string;
  ipAddress: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface DetectionConfig {
  detectionThreshold: number;
  confidenceThreshold: number;
}

export interface NetworkConfig {
  interfaces: string[];
  samplingRate: number;
  maxQueueSize: number;
  bufferTimeout: number;
}

export interface DatabaseConfig {
  alertRetentionDays: number;
  historyRetentionDays: number;
  autoArchive: boolean;
  usedSpace: number;
  totalSpace: number;
}

export interface PerformanceConfig {
  maxConcurrentInferences: number;
  useGPU: boolean;
  batchSize: number;
  realtimeProcessing: boolean;
}

export interface EmailConfig {
  smtpServer: string;
  smtpPort: number;
  username: string;
  password: string;
  recipients: string[];
  minSeverity: 'critical' | 'high' | 'medium' | 'low';
  digestFrequency: 'immediate' | 'hourly' | 'daily';
}

export interface NotificationConfig {
  browserNotifications: boolean;
  soundEnabled: boolean;
}
