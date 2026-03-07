import { useState } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

const NOTIFICATIONS = [
  { title: 'Critical Alert',  desc: 'SQL Injection detected from 192.168.1.105', time: '2m ago',  severity: 'critical' },
  { title: 'High Priority',   desc: 'DDoS attack pattern identified',             time: '15m ago', severity: 'high' },
  { title: 'System Update',   desc: 'Detection models updated successfully',      time: '1h ago',  severity: 'info' },
];

const severityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  info:     'bg-blue-500',
};

const Header = ({ sidebarCollapsed }: HeaderProps) => {
  const navigate = useNavigate();
  const [notifications] = useState(5);
  const { user } = useAuth();

  const displayName = user?.name ?? user?.email ?? 'John Doe';
  const roleLabel   = user?.role === 'admin'
    ? 'Administrator'
    : user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : 'Security Analyst';

  const initials = (() => {
    if (user?.name)  return user.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'JD';
  })();

  return (
    <header
      className="fixed top-0 right-0 left-60 h-14 bg-card border-b border-border/60 z-40 transition-all duration-300 flex items-center justify-between px-5"
    >
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search alerts, IPs, threats..."
          className="pl-9 h-9 text-sm bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border/60 shadow-lg p-0">
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <span className="text-xs rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 font-medium">
                {notifications} new
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {NOTIFICATIONS.map((notif, i) => (
                <DropdownMenuItem key={i} className="px-4 py-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 gap-3 items-start">
                  <div className={cn('h-1.5 w-1.5 rounded-full mt-2 shrink-0', severityDot[notif.severity])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.desc}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{notif.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            <div className="px-3 py-2 border-t border-border/40">
              <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-primary hover:text-primary hover:bg-primary/5">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-5 w-px bg-border/60 mx-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-9 px-2.5 text-left hover:bg-muted rounded-lg"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">{initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground leading-tight">{roleLabel}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border/60 shadow-lg">
            <DropdownMenuItem
              onClick={() => navigate('/dashboard/profile')}
              className="text-sm cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
            >
              <User className="mr-2.5 h-3.5 w-3.5 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/dashboard/settings')}
              className="text-sm cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
            >
              <Settings className="mr-2.5 h-3.5 w-3.5 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={() => navigate('/login')}
              className="text-sm cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-500/5 focus:bg-red-500/5"
            >
              <LogOut className="mr-2.5 h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;