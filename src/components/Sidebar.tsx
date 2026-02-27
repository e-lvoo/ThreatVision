import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',         path: '/dashboard' },
  { icon: Bell,            label: 'Alerts',            path: '/dashboard/alerts' },
  { icon: Clock,           label: 'Detection History', path: '/dashboard/history' },
  { icon: Settings,        label: 'Settings',          path: '/dashboard/settings' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r border-border/60 z-50 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-14 border-b border-border/40 flex items-center shrink-0',
        collapsed ? 'justify-center px-0' : 'px-5'
      )}>
        {collapsed
          ? <Shield className="h-5 w-5 text-primary" />
          : <Logo size="md" />
        }
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group relative',
                isActive
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}

              <item.icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )} />

              {!collapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Section label — only when expanded */}
      {!collapsed && (
        <div className="px-4 pb-1">
          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
            Account
          </span>
        </div>
      )}

      {/* Logout */}
      <div className="p-2.5 border-t border-border/40">
        <button
          onClick={() => navigate('/login')}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors duration-150 text-sm',
            'text-muted-foreground hover:bg-red-500/8 hover:text-red-500'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card border border-border/60 hover:bg-muted shadow-sm"
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
          : <ChevronLeft  className="h-3 w-3 text-muted-foreground" />
        }
      </Button>
    </aside>
  );
};

export default Sidebar;