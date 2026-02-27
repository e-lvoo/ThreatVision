/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Mail, Lock, Shield, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockAlerts } from '@/data/mockData';

const Profile = () => {
  const { user } = useAuth();
  const recentAlerts = mockAlerts.slice(0, 6);
  const primaryAlerts = recentAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const handleCopyApiKey = () => {
    const apiKey = 'sk-proj-abc123xyz789...';
    navigator.clipboard.writeText(apiKey);
    toast({ title: 'API Key Copied', description: 'Successfully copied to clipboard' });
  };
  const handleRegenerateKey = () => {
    toast({ title: 'API Key Regenerated', description: 'New key generated and ready to use' });
  };
  const handleEnableNotifications = () => {
    toast({ title: 'Notifications Enabled', description: 'You will now receive email notifications for critical alerts' });
  };
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>
      <Card className="p-8 border-border/30 backdrop-blur-md bg-card/30">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{user?.name || 'User'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Admin</Badge>
              <Badge variant="secondary" className="bg-status-online/20 text-status-online">Active</Badge>
            </div>
          </div>
        </div>
        <div className="space-y-4 pt-6 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email Address</span>
            </div>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Password</span>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
        </div>
      </Card>
      <Card className="p-6 border-border/30 backdrop-blur-md bg-card/30">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          API Key Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/20">
            <code className="text-xs text-muted-foreground flex-1">sk-proj-abc123xyz789...</code>
            <Button variant="ghost" size="sm" onClick={handleCopyApiKey}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerateKey}>Regenerate Key</Button>
            <Button variant="outline" size="sm">View Documentation</Button>
          </div>
        </div>
      </Card>
      <Card className="p-6 border-border/30 backdrop-blur-md bg-card/30">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Detection Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20">
            <Label className="text-sm font-medium cursor-pointer">Email Notifications</Label>
            <Switch defaultChecked onCheckedChange={handleEnableNotifications} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20">
            <Label className="text-sm font-medium cursor-pointer">Critical Alerts Only</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
      <Card className="p-6 border-border/30 backdrop-blur-md bg-card/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {primaryAlerts.length > 0 ? (
            primaryAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20 hover:border-border/40 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("h-2 w-2 rounded-full", alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500')} />
                  <span className="text-sm text-foreground truncate">{alert.title}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">{alert.timestamp}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent alerts</p>
          )}
        </div>
      </Card>
    </div>
  );
};

import { cn } from '@/lib/utils';

export default Profile;