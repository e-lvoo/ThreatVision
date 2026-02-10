import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, RefreshCw, Filter, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AuditLogEntry } from '@/types/settings';
import { cn } from '@/lib/utils';

interface AuditLogTabProps {
  logs: AuditLogEntry[];
}

const actionColors: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400 border-green-500/30',
  update: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delete: 'bg-red-500/20 text-red-400 border-red-500/30',
  login: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  logout: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  deploy: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const AuditLogTab = ({ logs }: AuditLogTabProps) => {
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const uniqueUsers = [...new Set(logs.map(l => l.user))];
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  useEffect(() => {
    let filtered = logs;
    if (userFilter !== 'all') {
      filtered = filtered.filter(l => l.user === userFilter);
    }
    if (actionFilter !== 'all') {
      filtered = filtered.filter(l => l.action === actionFilter);
    }
    setFilteredLogs(filtered);
  }, [logs, userFilter, actionFilter]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: 'Log Refreshed', description: 'Audit log updated with latest entries.' });
    }, 1000);
  };

  const handleExport = () => {
    const csvContent = [
      'Timestamp,User,Action,Resource,IP Address,Status,Details',
      ...filteredLogs.map(log => 
        `${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')},${log.user},${log.action},${log.resource},${log.ipAddress},${log.status},"${log.details || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: 'Audit log downloaded as CSV.' });
  };

  return (
    <Card className="glass-card border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>System activity and user actions</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Log
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(userFilter !== 'all' || actionFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setUserFilter('all'); setActionFilter('all'); }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Log Table */}
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(log.timestamp, 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge className={cn(actionColors[log.action])}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.resource}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress}</TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {log.details || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground text-center pt-2">
          Showing {filteredLogs.length} of {logs.length} entries
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogTab;
