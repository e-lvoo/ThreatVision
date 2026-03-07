import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Users, Server, Bell, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/DashboardLayout';
import DetectionSettingsTab from '@/components/settings/DetectionSettingsTab';
import UserManagementTab from '@/components/settings/UserManagementTab';
import SystemConfigTab from '@/components/settings/SystemConfigTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import AuditLogTab from '@/components/settings/AuditLogTab';
import {
  mockDetectionConfig,
  mockAlertRules,
  mockWhitelist,
  mockBlacklist,
  mockUsers,
  mockNetworkConfig,
  mockDatabaseConfig,
  mockPerformanceConfig,
  mockEmailConfig,
  mockWebhooks,
  mockNotificationConfig,
  mockAuditLog,
} from '@/data/settingsData';
import { 
  AlertRule, 
  IPListItem, 
  SystemUser, 
  DetectionConfig,
  NetworkConfig,
  DatabaseConfig,
  PerformanceConfig,
  EmailConfig,
  WebhookConfig,
  NotificationConfig
} from '@/types/settings';

const Settings = () => {
  // Detection Settings State
  const [detectionConfig, setDetectionConfig] = useState<DetectionConfig>(mockDetectionConfig);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [whitelist, setWhitelist] = useState<IPListItem[]>(mockWhitelist);
  const [blacklist, setBlacklist] = useState<IPListItem[]>(mockBlacklist);

  // User Management State
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);

  // System Config State
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(mockNetworkConfig);
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>(mockDatabaseConfig);
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>(mockPerformanceConfig);

  // Notifications State
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(mockEmailConfig);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(mockNotificationConfig);

  return (
    <DashboardLayout>
      <div className="space-y-6 pl-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">Configure system settings and manage users</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="detection" className="animate-fade-in-up">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="detection" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Detection</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="mt-6">
            <DetectionSettingsTab
              config={detectionConfig}
              rules={alertRules}
              whitelist={whitelist}
              blacklist={blacklist}
              onConfigChange={setDetectionConfig}
              onRulesChange={setAlertRules}
              onWhitelistChange={setWhitelist}
              onBlacklistChange={setBlacklist}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab
              users={users}
              onUsersChange={setUsers}
            />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <SystemConfigTab
              networkConfig={networkConfig}
              databaseConfig={databaseConfig}
              performanceConfig={performanceConfig}
              onNetworkChange={setNetworkConfig}
              onDatabaseChange={setDatabaseConfig}
              onPerformanceChange={setPerformanceConfig}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsTab
              emailConfig={emailConfig}
              webhooks={webhooks}
              notificationConfig={notificationConfig}
              onEmailChange={setEmailConfig}
              onWebhooksChange={setWebhooks}
              onNotificationChange={setNotificationConfig}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogTab logs={mockAuditLog} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
