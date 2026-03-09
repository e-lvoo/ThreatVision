/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Mail, Lock, Shield, Activity, Eye, EyeOff, Key, Bell, CheckCircle2, AlertTriangle, RefreshCw, BookOpen, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockAlerts } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


// ===== SHARED =====
const severityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-amber-500',
  low:      'bg-blue-500',
};

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border border-border/60 bg-card', className)}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
  <div className="flex items-center gap-3 px-6 py-5 border-b border-border/40">
    <div className="p-1.5 rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  </div>
);

const DetailRow = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('flex items-center justify-between py-3 border-b border-border/40 last:border-0', className)}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);


// ===== INTERNAL COMPONENT: ProfileCard =====
const ProfileCard = ({ user }: { user: any }) => {
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U';
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role ?? 'Security Analyst';

  return (
    <SectionCard>
      {/* Cover strip */}
      <div className="h-24 rounded-t-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar className="h-16 w-16 border-4 border-card">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
              alt={user?.name || 'User'}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">{user?.name || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex flex-col items-center gap-1.5 mt-3">
            <Badge className="rounded-full px-2.5 py-0.5 text-xs bg-primary/10 text-primary border-0">
              {roleLabel}
            </Badge>
            <Badge className="rounded-full px-2.5 py-0.5 text-xs bg-emerald-500/10 text-emerald-500 border-0">
              Active
            </Badge>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-border/40">
          {[
            { label: 'Alerts Reviewed', value: '1,284' },
            { label: 'Threats Resolved', value: '97' },
            { label: 'Accuracy Rate', value: '98.2%' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};


// ===== INTERNAL COMPONENT: AccountDetails =====
const AccountDetails = ({ user }: { user: any }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = () => {
    toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
    setShowPasswordForm(false);
  };

  return (
    <SectionCard>
      <SectionHeader icon={Lock} title="Account Details" description="Manage your login credentials" />

      <div className="px-6 py-4">
        <DetailRow label="Email Address">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm">{user?.email}</span>
          </div>
        </DetailRow>

        <DetailRow label="Password">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswordForm(v => !v)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </Button>
        </DetailRow>

        {showPasswordForm && (
          <div className="mt-4 space-y-3 pt-4 border-t border-border/40">
            {[
              { id: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
              { id: 'new',     label: 'New Password',     show: showNew,     toggle: () => setShowNew(v => !v) },
            ].map(({ id, label, show, toggle }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                <div className="relative">
                  <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    className="h-9 text-sm border-border/60 bg-background pr-9"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={handleChangePassword} className="h-9 px-4 text-sm mt-1">
              Update Password
            </Button>
          </div>
        )}

        <DetailRow label="Account Created" className="mt-0">
          <span className="text-muted-foreground text-xs">March 12, 2024</span>
        </DetailRow>

        <DetailRow label="Last Login">
          <span className="text-muted-foreground text-xs">Today at 09:41 AM</span>
        </DetailRow>
      </div>
    </SectionCard>
  );
};


// ===== INTERNAL COMPONENT: ApiKeyCard =====
const ApiKeyCard = () => {
  const [visible, setVisible] = useState(false);
  const API_KEY = 'sk-proj-abc123xyz789defghijklmnopqrst';
  const masked  = 'sk-proj-••••••••••••••••••••••••••';

  const handleCopy = () => {
    navigator.clipboard.writeText(API_KEY);
    toast({ title: 'API Key Copied', description: 'Successfully copied to clipboard.' });
  };

  const handleRegenerate = () => {
    toast({ title: 'API Key Regenerated', description: 'Your new key is ready to use.' });
  };

  return (
    <SectionCard>
      <SectionHeader icon={Key} title="API Key" description="Use this key to authenticate API requests" />

      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background border border-border/60">
          <code className="text-xs text-muted-foreground flex-1 font-mono">
            {visible ? API_KEY : masked}
          </code>
          <button
            onClick={() => setVisible(v => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <div className="w-px h-4 bg-border/60" />
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            className="h-8 px-3 text-xs border-border/60 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs border-border/60 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-3 w-3 mr-1.5" />
            Documentation
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};


// ===== INTERNAL COMPONENT: NotificationPreferences =====
const PREFERENCES = [
  { id: 'email-notifs',    label: 'Email Notifications',    description: 'Receive alerts via email',                      defaultChecked: true  },
  { id: 'critical-only',  label: 'Critical Alerts Only',    description: 'Skip low and medium severity notifications',     defaultChecked: true  },
  { id: 'weekly-digest',  label: 'Weekly Digest',           description: 'Summary report every Monday',                   defaultChecked: false },
  { id: 'auto-ack',       label: 'Auto-acknowledge Low',    description: 'Automatically acknowledge low severity alerts', defaultChecked: false },
];

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFERENCES.map(p => [p.id, p.defaultChecked]))
  );

  const handleToggle = (id: string, value: boolean) => {
    setPrefs(prev => ({ ...prev, [id]: value }));
    const pref = PREFERENCES.find(p => p.id === id);
    toast({ title: value ? 'Setting Enabled' : 'Setting Disabled', description: pref?.label });
  };

  return (
    <SectionCard>
      <SectionHeader icon={Bell} title="Notifications & Preferences" description="Control how you receive alerts and updates" />

      <div className="px-6 py-2">
        {PREFERENCES.map((pref, i) => (
          <div
            key={pref.id}
            className={cn(
              'flex items-center justify-between py-4',
              i < PREFERENCES.length - 1 && 'border-b border-border/40'
            )}
          >
            <div>
              <Label htmlFor={pref.id} className="text-sm font-medium text-foreground cursor-pointer">
                {pref.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
            </div>
            <Switch
              id={pref.id}
              checked={prefs[pref.id]}
              onCheckedChange={(v) => handleToggle(pref.id, v)}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
};


// ===== INTERNAL COMPONENT: RecentActivity =====
const RecentActivity = ({ alerts }: { alerts: any[] }) => {
  const primary = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 5);

  return (
    <SectionCard>
      <SectionHeader icon={Activity} title="Recent Activity" description="Your latest reviewed alerts" />

      <div className="px-6 py-2">
        {primary.length > 0 ? (
          primary.map((alert, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 py-3.5',
                i < primary.length - 1 && 'border-b border-border/40'
              )}
            >
              <div className={cn('h-2 w-2 rounded-full shrink-0', severityDot[alert.severity])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.sourceIp || alert.source || '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs rounded-full px-2 py-0.5 border capitalize',
                    alert.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    alert.severity === 'high'     ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  )}
                >
                  {alert.severity}
                </Badge>
                <span className="text-xs text-muted-foreground/60 w-16 text-right">
                  {alert.timestamp instanceof Date
                    ? format(alert.timestamp, 'HH:mm')
                    : String(alert.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 opacity-20" />
            <p className="text-sm">No recent alerts</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};


// ===== INTERNAL COMPONENT: DangerZone =====
const DangerZone = () => {
  const handleDeactivate = () => {
    toast({ title: 'Account Deactivated', description: 'Your account has been scheduled for deactivation.' });
  };

  return (
    <SectionCard>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500 rounded-t-2xl" />
      <SectionHeader icon={AlertTriangle} title="Danger Zone" description="Irreversible account actions" />
      <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Deactivate Account</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently disable your account and revoke all access.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeactivate}
          className="h-9 px-4 text-sm border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 shrink-0"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Deactivate
        </Button>
      </div>
    </SectionCard>
  );
};


// ===== MAIN PAGE COMPONENT =====
const Profile = () => {
  const { user } = useAuth();
  const recentAlerts = mockAlerts.slice(0, 10);

  return (
    <div className="pl-6 flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-2xl w-full space-y-5 animate-fade-in">

        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

      <ProfileCard user={user} />
      <AccountDetails user={user} />
      <ApiKeyCard />
      <NotificationPreferences />
      <RecentActivity alerts={recentAlerts} />
      <div className="relative">
        <DangerZone />
      </div>

      </div>
    </div>
  );
};

export default Profile;