import { 
  AlertRule, 
  IPListItem, 
  SystemUser, 
  WebhookConfig, 
  AuditLogEntry,
  DetectionConfig,
  NetworkConfig,
  DatabaseConfig,
  PerformanceConfig,
  EmailConfig,
  NotificationConfig
} from '@/types/settings';
import { subDays, subHours, subMinutes } from 'date-fns';

export const mockDetectionConfig: DetectionConfig = {
  detectionThreshold: 85,
  confidenceThreshold: 70,
};

export const mockAlertRules: AlertRule[] = [
  {
    id: 'rule-1',
    name: 'Critical IP Block',
    condition: 'ip',
    operator: 'equals',
    value: '192.168.1.100',
    severity: 'critical',
    enabled: true,
    order: 1,
  },
  {
    id: 'rule-2',
    name: 'Ransomware Detection',
    condition: 'threat_type',
    operator: 'equals',
    value: 'Ransomware',
    severity: 'critical',
    enabled: true,
    order: 2,
  },
  {
    id: 'rule-3',
    name: 'High Confidence Threats',
    condition: 'confidence',
    operator: 'greater_than',
    value: '95',
    severity: 'high',
    enabled: true,
    order: 3,
  },
  {
    id: 'rule-4',
    name: 'Port Scan Detection',
    condition: 'port',
    operator: 'equals',
    value: '22',
    severity: 'medium',
    enabled: false,
    order: 4,
  },
];

export const mockWhitelist: IPListItem[] = [
  { id: 'wl-1', ip: '10.0.0.1', addedBy: 'admin@threatvision.io', addedAt: subDays(new Date(), 30), reason: 'Internal server' },
  { id: 'wl-2', ip: '10.0.0.2', addedBy: 'admin@threatvision.io', addedAt: subDays(new Date(), 25), reason: 'Backup server' },
  { id: 'wl-3', ip: '192.168.1.1', addedBy: 'analyst@threatvision.io', addedAt: subDays(new Date(), 10), reason: 'Gateway' },
];

export const mockBlacklist: IPListItem[] = [
  { id: 'bl-1', ip: '45.33.32.156', addedBy: 'admin@threatvision.io', addedAt: subDays(new Date(), 5), reason: 'Known malicious' },
  { id: 'bl-2', ip: '185.220.101.1', addedBy: 'system', addedAt: subDays(new Date(), 2), reason: 'TOR exit node' },
  { id: 'bl-3', ip: '23.129.64.100', addedBy: 'system', addedAt: subDays(new Date(), 1), reason: 'Botnet C2' },
];

export const mockUsers: SystemUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@threatvision.io',
    role: 'admin',
    status: 'active',
    lastLogin: subHours(new Date(), 2),
    permissions: {
      viewAlerts: true,
      acknowledgeAlerts: true,
      manageModels: true,
      accessSettings: true,
      manageUsers: true,
    },
  },
  {
    id: 'user-2',
    username: 'jsmith',
    email: 'jsmith@threatvision.io',
    role: 'analyst',
    status: 'active',
    lastLogin: subHours(new Date(), 5),
    permissions: {
      viewAlerts: true,
      acknowledgeAlerts: true,
      manageModels: true,
      accessSettings: false,
      manageUsers: false,
    },
  },
  {
    id: 'user-3',
    username: 'mwilson',
    email: 'mwilson@threatvision.io',
    role: 'analyst',
    status: 'active',
    lastLogin: subDays(new Date(), 1),
    permissions: {
      viewAlerts: true,
      acknowledgeAlerts: true,
      manageModels: false,
      accessSettings: false,
      manageUsers: false,
    },
  },
  {
    id: 'user-4',
    username: 'viewer1',
    email: 'viewer@threatvision.io',
    role: 'viewer',
    status: 'inactive',
    lastLogin: subDays(new Date(), 14),
    permissions: {
      viewAlerts: true,
      acknowledgeAlerts: false,
      manageModels: false,
      accessSettings: false,
      manageUsers: false,
    },
  },
];

export const rolePermissionsMatrix = {
  viewAlerts: { admin: true, analyst: true, viewer: true },
  acknowledgeAlerts: { admin: true, analyst: true, viewer: false },
  manageModels: { admin: true, analyst: true, viewer: false },
  accessSettings: { admin: true, analyst: false, viewer: false },
  manageUsers: { admin: true, analyst: false, viewer: false },
};

export const mockNetworkConfig: NetworkConfig = {
  interfaces: ['eth0', 'eth1'],
  samplingRate: 50,
  maxQueueSize: 10000,
  bufferTimeout: 30,
};

export const mockDatabaseConfig: DatabaseConfig = {
  alertRetentionDays: 30,
  historyRetentionDays: 90,
  autoArchive: true,
  usedSpace: 45.2,
  totalSpace: 100,
};

export const mockPerformanceConfig: PerformanceConfig = {
  maxConcurrentInferences: 32,
  useGPU: true,
  batchSize: 64,
  realtimeProcessing: true,
};

export const mockEmailConfig: EmailConfig = {
  smtpServer: 'smtp.threatvision.io',
  smtpPort: 587,
  username: 'alerts@threatvision.io',
  password: '••••••••••••',
  recipients: ['security@company.com', 'admin@company.com'],
  minSeverity: 'high',
  digestFrequency: 'immediate',
};

export const mockWebhooks: WebhookConfig[] = [
  {
    id: 'wh-1',
    url: 'https://slack.com/api/webhooks/threatvision',
    events: {
      alertCreated: true,
      alertAcknowledged: false,
      alertResolved: true,
      modelDeployed: true,
    },
    enabled: true,
    lastTriggered: subHours(new Date(), 1),
  },
  {
    id: 'wh-2',
    url: 'https://api.pagerduty.com/alerts',
    events: {
      alertCreated: true,
      alertAcknowledged: true,
      alertResolved: true,
      modelDeployed: false,
    },
    enabled: true,
    lastTriggered: subHours(new Date(), 3),
  },
];

export const mockNotificationConfig: NotificationConfig = {
  browserNotifications: true,
  soundEnabled: false,
};

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: subMinutes(new Date(), 5),
    user: 'admin@threatvision.io',
    action: 'login',
    resource: 'System',
    ipAddress: '10.0.0.50',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: subMinutes(new Date(), 15),
    user: 'admin@threatvision.io',
    action: 'update',
    resource: 'Detection Config',
    ipAddress: '10.0.0.50',
    status: 'success',
    details: 'Changed threshold from 80% to 85%',
  },
  {
    id: 'log-3',
    timestamp: subMinutes(new Date(), 30),
    user: 'jsmith@threatvision.io',
    action: 'create',
    resource: 'Alert Rule',
    ipAddress: '10.0.0.51',
    status: 'success',
    details: 'Created rule: Port Scan Detection',
  },
  {
    id: 'log-4',
    timestamp: subHours(new Date(), 1),
    user: 'admin@threatvision.io',
    action: 'deploy',
    resource: 'ML Model',
    ipAddress: '10.0.0.50',
    status: 'success',
    details: 'Deployed Hybrid CNN-LSTM v2.3',
  },
  {
    id: 'log-5',
    timestamp: subHours(new Date(), 2),
    user: 'mwilson@threatvision.io',
    action: 'update',
    resource: 'Alert #1234',
    ipAddress: '10.0.0.52',
    status: 'success',
    details: 'Status changed to Acknowledged',
  },
  {
    id: 'log-6',
    timestamp: subHours(new Date(), 3),
    user: 'viewer@threatvision.io',
    action: 'login',
    resource: 'System',
    ipAddress: '192.168.1.100',
    status: 'failed',
    details: 'Invalid password attempt',
  },
  {
    id: 'log-7',
    timestamp: subHours(new Date(), 4),
    user: 'admin@threatvision.io',
    action: 'delete',
    resource: 'User',
    ipAddress: '10.0.0.50',
    status: 'success',
    details: 'Deleted user: testuser',
  },
  {
    id: 'log-8',
    timestamp: subHours(new Date(), 5),
    user: 'system',
    action: 'create',
    resource: 'Blacklist',
    ipAddress: 'internal',
    status: 'success',
    details: 'Auto-added IP: 185.220.101.1',
  },
  {
    id: 'log-9',
    timestamp: subDays(new Date(), 1),
    user: 'jsmith@threatvision.io',
    action: 'logout',
    resource: 'System',
    ipAddress: '10.0.0.51',
    status: 'success',
  },
  {
    id: 'log-10',
    timestamp: subDays(new Date(), 1),
    user: 'admin@threatvision.io',
    action: 'update',
    resource: 'SMTP Config',
    ipAddress: '10.0.0.50',
    status: 'success',
    details: 'Updated email recipients',
  },
];

export const availableInterfaces = ['eth0', 'eth1', 'eth2', 'wlan0', 'docker0'];
