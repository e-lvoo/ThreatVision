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

const Header = ({ sidebarCollapsed }: HeaderProps) => {
  const navigate = useNavigate();
  const [notifications] = useState(5);
  const { user } = useAuth();

  const displayName = user?.name ?? user?.email ?? 'John Doe';
  const initials = (() => {
    if (user?.name) return user.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'JD';
  })();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 glass-card border-b border-border/50 z-40 transition-all duration-300 flex items-center justify-between px-6',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search alerts, IPs, threats..."
          className="pl-10 bg-muted/30 border-border/50"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground animate-pulse">
                  {notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-card">
            <div className="p-3 border-b border-border/50">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-cyber">
              {[
                { title: 'Critical Alert', desc: 'SQL Injection detected from 192.168.1.105', time: '2m ago', severity: 'critical' },
                { title: 'High Priority', desc: 'DDoS attack pattern identified', time: '15m ago', severity: 'high' },
                { title: 'System Update', desc: 'Detection models updated successfully', time: '1h ago', severity: 'info' },
              ].map((notif, i) => (
                <DropdownMenuItem key={i} className="p-3 cursor-pointer">
                  <div className="flex gap-3">
                    <div className={cn(
                      'h-2 w-2 rounded-full mt-2',
                      notif.severity === 'critical' && 'bg-red-500',
                      notif.severity === 'high' && 'bg-orange-500',
                      notif.severity === 'info' && 'bg-blue-500'
                    )} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="p-2 border-t border-border/50">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">{initials}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrator' : (user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Security Analyst')}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card">
            <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/login')} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;