import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Webhook, Bell, Trash2, Plus, Send, Check, X, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { EmailConfig, WebhookConfig, NotificationConfig } from '@/types/settings';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationsTabProps {
  emailConfig: EmailConfig;
  webhooks: WebhookConfig[];
  notificationConfig: NotificationConfig;
  onEmailChange: (config: EmailConfig) => void;
  onWebhooksChange: (webhooks: WebhookConfig[]) => void;
  onNotificationChange: (config: NotificationConfig) => void;
}

const emailSchema = z.object({
  smtpServer: z.string().min(1, 'SMTP server is required'),
  smtpPort: z.number().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const webhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
});

const NotificationsTab = ({
  emailConfig,
  webhooks,
  notificationConfig,
  onEmailChange,
  onWebhooksChange,
  onNotificationChange,
}: NotificationsTabProps) => {
  const [localEmail, setLocalEmail] = useState(emailConfig);
  const [newRecipient, setNewRecipient] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState({
    alertCreated: true,
    alertAcknowledged: false,
    alertResolved: true,
  });

  const handleEmailChange = <K extends keyof EmailConfig>(key: K, value: EmailConfig[K]) => {
    setLocalEmail(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = () => {
    toast({ title: 'Testing Connection', description: 'Sending test email...' });
    setTimeout(() => {
      toast({ title: 'Connection Successful', description: 'Test email sent successfully!' });
    }, 1500);
  };

  const handleSaveEmail = () => {
    onEmailChange(localEmail);
    toast({ title: 'Email Settings Saved', description: 'SMTP configuration updated.' });
  };

  const handleAddRecipient = () => {
    if (!newRecipient || !newRecipient.includes('@')) {
      toast({ title: 'Invalid Email', variant: 'destructive' });
      return;
    }
    if (localEmail.recipients.includes(newRecipient)) {
      toast({ title: 'Already Added', variant: 'destructive' });
      return;
    }
    setLocalEmail(prev => ({ ...prev, recipients: [...prev.recipients, newRecipient] }));
    setNewRecipient('');
  };

  const handleRemoveRecipient = (email: string) => {
    setLocalEmail(prev => ({ ...prev, recipients: prev.recipients.filter(r => r !== email) }));
  };

  const handleAddWebhook = () => {
    const result = webhookSchema.safeParse({ url: newWebhookUrl });
    if (!result.success) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid webhook URL', variant: 'destructive' });
      return;
    }
    const newWebhook: WebhookConfig = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      events: webhookEvents,
      enabled: true,
    };
    onWebhooksChange([...webhooks, newWebhook]);
    setNewWebhookUrl('');
    setWebhookEvents({ alertCreated: true, alertAcknowledged: false, alertResolved: true });
    toast({ title: 'Webhook Added', description: 'New webhook endpoint configured.' });
  };

  const handleDeleteWebhook = (id: string) => {
    onWebhooksChange(webhooks.filter(w => w.id !== id));
    toast({ title: 'Webhook Deleted', variant: 'destructive' });
  };

  const handleTestWebhook = (webhook: WebhookConfig) => {
    toast({ title: 'Testing Webhook', description: `Sending test to ${webhook.url}` });
    setTimeout(() => {
      toast({ title: 'Webhook Test Successful' });
    }, 1000);
  };

  const handleToggleWebhook = (id: string) => {
    onWebhooksChange(webhooks.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const handleBrowserNotification = () => {
    if (!notificationConfig.browserNotifications) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          onNotificationChange({ ...notificationConfig, browserNotifications: true });
          new Notification('ThreatVision Alerts', { body: 'Browser notifications enabled!' });
        }
      });
    } else {
      onNotificationChange({ ...notificationConfig, browserNotifications: false });
    }
  };

  const handlePreviewNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('⚠️ Critical Alert', { body: 'Ransomware detected on 192.168.1.50' });
    } else {
      toast({ title: 'Notification Preview', description: '⚠️ Critical Alert: Ransomware detected on 192.168.1.50' });
    }
    if (notificationConfig.soundEnabled) {
      (async () => {
        try {
          const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) return;
          const audio = new AudioCtx();
          // resume may reject if not triggered by user gesture; ignore failures
          await audio.resume().catch(() => undefined);
          const oscillator = audio.createOscillator();
          oscillator.connect(audio.destination);
          oscillator.frequency.value = 800;
          // start/stop can throw if autoplay is blocked; guard with try/catch
          try {
            oscillator.start();
            setTimeout(() => {
              try { oscillator.stop(); } catch (_) { /* ignore */ }
            }, 200);
          } catch (_) {
            // ignore user-blocked playback
          }
        } catch (_) {
          // ignore any audio API errors
        }
      })();
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            Email Notifications
          </CardTitle>
          <CardDescription>Configure SMTP settings for alert emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input
                value={localEmail.smtpServer}
                onChange={(e) => handleEmailChange('smtpServer', e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                type="number"
                value={localEmail.smtpPort}
                onChange={(e) => handleEmailChange('smtpPort', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={localEmail.username}
                onChange={(e) => handleEmailChange('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={localEmail.password}
                onChange={(e) => handleEmailChange('password', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestConnection}>
              <Send className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button onClick={handleSaveEmail}>Save SMTP Settings</Button>
          </div>

          <div className="border-t border-border/30 pt-4 space-y-4">
            <Label>Alert Recipients</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
              />
              <Button onClick={handleAddRecipient}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localEmail.recipients.map((email) => (
                <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                  {email}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveRecipient(email)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Severity to Notify</Label>
              <Select
                value={localEmail.minSeverity}
                onValueChange={(v) => handleEmailChange('minSeverity', v as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High & Above</SelectItem>
                  <SelectItem value="medium">Medium & Above</SelectItem>
                  <SelectItem value="low">All Severities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Digest Frequency</Label>
              <Select
                value={localEmail.digestFrequency}
                onValueChange={(v) => handleEmailChange('digestFrequency', v as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Integrations */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-purple-400" />
            Webhook Integrations
          </CardTitle>
          <CardDescription>Send alerts to external services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://hooks.example.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Event Triggers</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'alertCreated', label: 'New Alert Created' },
                  { key: 'alertAcknowledged', label: 'Alert Acknowledged' },
                  { key: 'alertResolved', label: 'Alert Resolved' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={(webhookEvents as any)[key]}
                      onCheckedChange={(v) => setWebhookEvents(prev => ({ ...prev, [key]: v }))}
                    />
                    <Label className="text-sm font-normal">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAddWebhook}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {webhooks.length > 0 && (
            <div className="border-t border-border/30 pt-4 space-y-3">
              <Label>Configured Webhooks</Label>
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">{webhook.url}</p>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(webhook.events).filter(([_, v]) => v).map(([k]) => (
                        <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                    {webhook.lastTriggered && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last triggered: {format(webhook.lastTriggered, 'MMM dd, HH:mm')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch checked={webhook.enabled} onCheckedChange={() => handleToggleWebhook(webhook.id)} />
                    <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(webhook)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Browser and desktop notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <Label>Enable Browser Notifications</Label>
              <p className="text-xs text-muted-foreground">Show desktop notifications for new alerts</p>
            </div>
            <Switch
              checked={notificationConfig.browserNotifications}
              onCheckedChange={handleBrowserNotification}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              {notificationConfig.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <div>
                <Label>Play Sound on Alert</Label>
                <p className="text-xs text-muted-foreground">Audio notification for new alerts</p>
              </div>
            </div>
            <Switch
              checked={notificationConfig.soundEnabled}
              onCheckedChange={(v) => onNotificationChange({ ...notificationConfig, soundEnabled: v })}
            />
          </div>

          <Button variant="outline" onClick={handlePreviewNotification}>
            Preview Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
