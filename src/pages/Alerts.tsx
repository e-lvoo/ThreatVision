import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertFilters } from '@/types/dashboard';
import { mockAlertsData, generateAlerts } from '@/data/alertsData';
import AlertFiltersBar from '@/components/alerts/AlertFiltersBar';
import AlertsAdvancedTable from '@/components/alerts/AlertsAdvancedTable';
import BulkActionsBar from '@/components/alerts/BulkActionsBar';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import { toast } from 'sonner';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlertsData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [liveCount, setLiveCount] = useState(alerts.length);
  
  const [filters, setFilters] = useState<AlertFilters>({
    search: '',
    dateFrom: null,
    dateTo: null,
    severity: 'all',
    status: 'all',
  });

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          alert.sourceIp.toLowerCase().includes(searchLower) ||
          alert.destinationIp.toLowerCase().includes(searchLower) ||
          alert.threatType.toLowerCase().includes(searchLower) ||
          alert.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateFrom && alert.timestamp < filters.dateFrom) return false;
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (alert.timestamp > endOfDay) return false;
      }

      // Severity filter
      if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;

      // Status filter
      if (filters.status !== 'all' && alert.status !== filters.status) return false;

      return true;
    });
  }, [alerts, filters]);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new alert
      const newAlerts = generateAlerts(1);
      newAlerts[0].id = `ALT-${String(alerts.length + 1).padStart(5, '0')}`;
      newAlerts[0].timestamp = new Date();
      newAlerts[0].status = 'open';
      
      setAlerts(prev => [newAlerts[0], ...prev]);
      setLiveCount(prev => prev + 1);
      
      toast.info(
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>New alert detected: {newAlerts[0].threatType}</span>
        </div>,
        { duration: 3000 }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, alerts.length]);

  // Live count update
  useEffect(() => {
    if (!autoRefresh) return;
    setLiveCount(alerts.length);
  }, [alerts.length, autoRefresh]);

  const handleExport = useCallback(() => {
    const headers = ['ID', 'Timestamp', 'Source IP', 'Destination IP', 'Threat Type', 'Severity', 'Status', 'Confidence'];
    const rows = filteredAlerts.map(alert => [
      alert.id,
      alert.timestamp.toISOString(),
      alert.sourceIp,
      alert.destinationIp,
      alert.threatType,
      alert.severity,
      alert.status,
      alert.confidenceScore
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Alerts exported successfully');
  }, [filteredAlerts]);

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setDetailModalOpen(true);
  };

  const handleAcknowledge = (alert: Alert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date() }
        : a
    ));
    toast.success(`Alert ${alert.id} acknowledged`);
  };

  const handleResolve = (alert: Alert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'resolved' as const, resolvedAt: new Date() }
        : a
    ));
    toast.success(`Alert ${alert.id} resolved`);
  };

  const handleDelete = (alert: Alert) => {
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
    setSelectedIds(prev => prev.filter(id => id !== alert.id));
    toast.success(`Alert ${alert.id} deleted`);
  };

  const handleBulkAcknowledge = () => {
    setAlerts(prev => prev.map(a => 
      selectedIds.includes(a.id) && a.status === 'open'
        ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date() }
        : a
    ));
    toast.success(`${selectedIds.length} alerts acknowledged`);
    setSelectedIds([]);
  };

  const handleBulkResolve = () => {
    setAlerts(prev => prev.map(a => 
      selectedIds.includes(a.id) && a.status !== 'resolved'
        ? { ...a, status: 'resolved' as const, resolvedAt: new Date() }
        : a
    ));
    toast.success(`${selectedIds.length} alerts resolved`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setAlerts(prev => prev.filter(a => !selectedIds.includes(a.id)));
    toast.success(`${selectedIds.length} alerts deleted`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor security incidents
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span className="text-muted-foreground">
              Live: <span className="font-mono text-foreground">{liveCount}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
              Auto-refresh
            </Label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AlertFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onAcknowledge={handleBulkAcknowledge}
        onResolve={handleBulkResolve}
        onDelete={handleBulkDelete}
        onDeselectAll={() => setSelectedIds([])}
      />

      {/* Table */}
      <AlertsAdvancedTable
        alerts={filteredAlerts}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onViewDetails={handleViewDetails}
        onAcknowledge={handleAcknowledge}
        onDelete={handleDelete}
      />

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
};

export default Alerts;
