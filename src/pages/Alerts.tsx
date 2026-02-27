/**
 * TEMP DESIGN MODE
 * This page has been flattened for redesign purposes.
 * Components will be extracted back into modular files after UI redesign.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Bell, Search, Calendar, X, Download, CheckSquare, XSquare, Trash2, Eye, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Copy, Bug, Shield, Skull, AlertTriangle, Zap, Target, Crosshair, Lock, Clock, CheckCircle2, Ban, FileText, Network, Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertFilters, AlertStatus } from '@/types/dashboard';
import { mockAlertsData, generateAlerts } from '@/data/alertsData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ===== INTERNAL COMPONENT: AlertFiltersBar =====
interface AlertFiltersBarProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  onExport: () => void;
}

const AlertFiltersBar = ({ filters, onFiltersChange, onExport }: AlertFiltersBarProps) => {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      dateFrom: null,
      dateTo: null,
      severity: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.dateFrom !== null || 
    filters.dateTo !== null || 
    filters.severity !== 'all' || 
    filters.status !== 'all';

  return (
    <div className="glass-card rounded-xl border border-border/30 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP, threat type..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>

        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full lg:w-[160px] justify-start text-left font-normal bg-background/50 border-border/50",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom || undefined}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateFrom: date || null });
                setDateFromOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full lg:w-[160px] justify-start text-left font-normal bg-background/50 border-border/50",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo || undefined}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateTo: date || null });
                setDateToOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.severity}
          onValueChange={(value) => onFiltersChange({ ...filters, severity: value as any })}
        >
          <SelectTrigger className="w-full lg:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
        >
          <SelectTrigger className="w-full lg:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        <Button onClick={onExport} className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: BulkActionsBar =====
interface BulkActionsBarProps {
  selectedCount: number;
  onAcknowledge: () => void;
  onResolve: () => void;
  onDelete: () => void;
  onDeselectAll: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onAcknowledge,
  onResolve,
  onDelete,
  onDeselectAll,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="glass-card rounded-xl border border-primary/30 bg-primary/5 p-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledge}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-400"
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Acknowledge Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResolve}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-400"
          >
            <XSquare className="h-4 w-4 mr-1" />
            Resolve Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: AlertsAdvancedTable =====
type SortField = 'id' | 'timestamp' | 'severity' | 'confidenceScore';
type SortDirection = 'asc' | 'desc';

const threatIcons = {
  virus: Bug,
  trojan: Skull,
  worm: Target,
  ransomware: Lock,
  ddos: Zap,
  phishing: AlertTriangle,
  injection: Crosshair,
  bruteforce: Shield,
};

const severityStyles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusStyles = {
  open: 'bg-red-500/20 text-red-400',
  acknowledged: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
};

const severityOrder = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

interface AlertsAdvancedTableProps {
  alerts: Alert[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewDetails: (alert: Alert) => void;
  onAcknowledge: (alert: Alert) => void;
  onDelete: (alert: Alert) => void;
}

const AlertsAdvancedTable = ({ 
  alerts, 
  selectedIds, 
  onSelectionChange, 
  onViewDetails, 
  onAcknowledge, 
  onDelete 
}: AlertsAdvancedTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'severity':
          comparison = (severityOrder as any)[a.severity] - (severityOrder as any)[b.severity];
          break;
        case 'confidenceScore':
          comparison = a.confidenceScore - b.confidenceScore;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [alerts, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAlerts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAlerts = sortedAlerts.slice(startIndex, startIndex + pageSize);

  const allSelected = paginatedAlerts.length > 0 && paginatedAlerts.every(a => selectedIds.includes(a.id));
  const someSelected = paginatedAlerts.some(a => selectedIds.includes(a.id));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !paginatedAlerts.find(a => a.id === id)));
    } else {
      const newIds = paginatedAlerts.map(a => a.id);
      onSelectionChange([...new Set([...selectedIds, ...newIds])]);
    }
  };

  const handleSelectOne = (alertId: string) => {
    if (selectedIds.includes(alertId)) {
      onSelectionChange(selectedIds.filter(id => id !== alertId));
    } else {
      onSelectionChange([...selectedIds, alertId]);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="glass-card rounded-xl border border-border/30">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected && !allSelected ? 'opacity-50' : ''}
                />
              </TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  Alert ID
                  <SortIcon field="id" />
                </div>
              </TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center">
                  Timestamp
                  <SortIcon field="timestamp" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">Source IP</TableHead>
              <TableHead className="text-muted-foreground">Dest IP</TableHead>
              <TableHead className="text-muted-foreground">Threat Type</TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center">
                  Severity
                  <SortIcon field="severity" />
                </div>
              </TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('confidenceScore')}
              >
                <div className="flex items-center">
                  Confidence
                  <SortIcon field="confidenceScore" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Shield className="h-12 w-12 opacity-30" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAlerts.map((alert) => {
                const ThreatIcon = (threatIcons as any)[alert.threatCategory] || Shield;
                return (
                  <TableRow 
                    key={alert.id} 
                    className={cn(
                      "border-border/30 transition-colors",
                      selectedIds.includes(alert.id) 
                        ? "bg-primary/5 hover:bg-primary/10" 
                        : "hover:bg-muted/30"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(alert.id)}
                        onCheckedChange={() => handleSelectOne(alert.id)}
                        aria-label={`Select ${alert.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-primary">
                      {alert.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                      {format(alert.timestamp, "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">
                          {alert.sourceIp}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(alert.sourceIp)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">
                          {alert.destinationIp}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(alert.destinationIp)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ThreatIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {alert.threatType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn('capitalize border', (severityStyles as any)[alert.severity])}
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress 
                          value={alert.confidenceScore} 
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {alert.confidenceScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn('capitalize', (statusStyles as any)[alert.status])}
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(alert)}
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {alert.status === 'open' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onAcknowledge(alert)}
                            className="h-8 w-8 text-yellow-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(alert)}
                          className="h-8 w-8 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedAlerts.length)} of {sortedAlerts.length} alerts
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[80px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
            return page <= totalPages ? (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ) : null;
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===== INTERNAL COMPONENT: AlertDetailModal =====
interface AlertDetailModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (alert: Alert) => void;
  onResolve: (alert: Alert) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AlertDetailModal = ({ 
  alert, 
  open, 
  onOpenChange, 
  onAcknowledge, 
  onResolve 
}: AlertDetailModalProps) => {
  const [notes, setNotes] = useState('');

  if (!alert) return null;

  const ThreatIcon = (threatIcons as any)[alert.threatCategory] || Shield;

  const handleSaveNotes = () => {
    toast.success('Notes saved successfully');
    setNotes('');
  };

  const handleAddToBlocklist = () => {
    toast.success(`${alert.sourceIp} added to blocklist`);
  };

  const handleGenerateReport = () => {
    toast.success('Report generation started');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-background border-border/50">
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {alert.id}
              </DialogTitle>
              <Badge 
                variant="outline" 
                className={cn('capitalize border', (severityStyles as any)[alert.severity])}
              >
                {alert.severity}
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn('capitalize', (statusStyles as any)[alert.status])}
              >
                {alert.status}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(alert.timestamp, "MMM dd, yyyy 'at' HH:mm:ss")}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="glass-card rounded-xl border border-border/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Network Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source IP</span>
                    <span className="font-mono text-foreground">{alert.sourceIp}:{alert.sourcePort}</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination IP</span>
                    <span className="font-mono text-foreground">{alert.destinationIp}:{alert.destinationPort}</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol</span>
                    <Badge variant="outline" className="font-mono">{alert.protocol}</Badge>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packet Count</span>
                    <span className="font-mono text-foreground">{alert.packetCount.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Byte Count</span>
                    <span className="font-mono text-foreground">{formatBytes(alert.byteCount)}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl border border-border/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Threat Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <ThreatIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{alert.threatType}</p>
                      <p className="text-sm text-muted-foreground capitalize">{alert.threatCategory}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-bold text-2xl text-primary">{alert.confidenceScore}%</span>
                    </div>
                    <Progress value={alert.confidenceScore} className="h-3" />
                  </div>
                  
                  <Separator className="bg-border/30" />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Used</span>
                    <span className="text-foreground">{alert.modelUsed}</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Detection Method</span>
                    <span className="text-foreground">{alert.detectionMethod}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-xl border border-border/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(alert.timestamp, "MMM dd, yyyy 'at' HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                  
                  {alert.acknowledgedAt && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-yellow-500/20">
                        <Check className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Acknowledged</p>
                        <p className="text-xs text-muted-foreground">
                          {format(alert.acknowledgedAt, "MMM dd, yyyy 'at' HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {alert.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          {format(alert.resolvedAt, "MMM dd, yyyy 'at' HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-xl border border-border/30 p-5">
                <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-400"
                    onClick={() => onAcknowledge(alert)}
                    disabled={alert.status !== 'open'}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-400"
                    onClick={() => onResolve(alert)}
                    disabled={alert.status === 'resolved'}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    onClick={handleAddToBlocklist}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Add to Blocklist
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerateReport}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              <div className="glass-card rounded-xl border border-border/30 p-5">
                <h3 className="font-semibold text-foreground mb-4">Notes</h3>
                
                {alert.notes && alert.notes.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {alert.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                        <p className="text-sm text-foreground">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.author} • {format(note.timestamp, "MMM dd, HH:mm")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <Textarea
                  placeholder="Add a note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] bg-background/50 border-border/50 mb-3"
                />
                <Button 
                  onClick={handleSaveNotes}
                  disabled={!notes.trim()}
                  className="w-full"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/30 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            onClick={() => {
              if (alert.status === 'open') onAcknowledge(alert);
              else if (alert.status === 'acknowledged') onResolve(alert);
              onOpenChange(false);
            }}
            disabled={alert.status === 'resolved'}
          >
            Take Action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===== MAIN PAGE COMPONENT =====
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

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          alert.sourceIp.toLowerCase().includes(searchLower) ||
          alert.destinationIp.toLowerCase().includes(searchLower) ||
          alert.threatType.toLowerCase().includes(searchLower) ||
          alert.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.dateFrom && alert.timestamp < filters.dateFrom) return false;
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (alert.timestamp > endOfDay) return false;
      }

      if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
      if (filters.status !== 'all' && alert.status !== filters.status) return false;

      return true;
    });
  }, [alerts, filters]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
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

      <AlertFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onAcknowledge={handleBulkAcknowledge}
        onResolve={handleBulkResolve}
        onDelete={handleBulkDelete}
        onDeselectAll={() => setSelectedIds([])}
      />

      <AlertsAdvancedTable
        alerts={filteredAlerts}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onViewDetails={handleViewDetails}
        onAcknowledge={handleAcknowledge}
        onDelete={handleDelete}
      />

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
