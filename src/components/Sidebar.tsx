import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Clock,
  Settings,
  LogOut,
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
  const location  = useLocation();
  const navigate  = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-card border-r border-border/60 z-50 w-60 flex flex-col">
      {/* Logo */}
      <div className="h-14 border-b border-border/40 flex items-center shrink-0 px-5">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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

              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Section label */}
      <div className="px-4 pb-1">
        <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
          Account
        </span>
      </div>

      {/* Logout */}
      <div className="p-2.5 border-t border-border/40">
        <button
          onClick={() => navigate('/login')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors duration-150 text-sm',
            'text-muted-foreground hover:bg-red-500/8 hover:text-red-500'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;