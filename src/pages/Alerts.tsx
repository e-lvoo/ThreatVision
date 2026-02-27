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


// ===== SHARED STYLE CONFIG =====
const severityStyles: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low:      'bg-blue-500/10 text-blue-500 border-blue-500/20',
  info:     'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const statusStyles: Record<string, string> = {
  open:         'bg-red-500/10 text-red-500',
  acknowledged: 'bg-amber-500/10 text-amber-500',
  resolved:     'bg-emerald-500/10 text-emerald-500',
};

const threatIcons = {
  virus:      Bug,
  trojan:     Skull,
  worm:       Target,
  ransomware: Lock,
  ddos:       Zap,
  phishing:   AlertTriangle,
  injection:  Crosshair,
  bruteforce: Shield,
};

const severityOrder: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};


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
    onFiltersChange({ search: '', dateFrom: null, dateTo: null, severity: 'all', status: 'all' });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.severity !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-col lg:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP, threat type, alert ID..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-background border-border/60 h-9 text-sm"
          />
        </div>

        {/* Date From */}
        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full lg:w-[155px] justify-start text-left font-normal h-9 text-sm border-border/60 bg-background',
                !filters.dateFrom && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-3.5 w-3.5" />
              {filters.dateFrom ? format(filters.dateFrom, 'MMM dd, yyyy') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom || undefined}
              onSelect={(date) => { onFiltersChange({ ...filters, dateFrom: date || null }); setDateFromOpen(false); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full lg:w-[155px] justify-start text-left font-normal h-9 text-sm border-border/60 bg-background',
                !filters.dateTo && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-3.5 w-3.5" />
              {filters.dateTo ? format(filters.dateTo, 'MMM dd, yyyy') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo || undefined}
              onSelect={(date) => { onFiltersChange({ ...filters, dateTo: date || null }); setDateToOpen(false); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Severity */}
        <Select value={filters.severity} onValueChange={(v) => onFiltersChange({ ...filters, severity: v as any })}>
          <SelectTrigger className="w-full lg:w-[140px] h-9 text-sm border-border/60 bg-background">
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

        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => onFiltersChange({ ...filters, status: v as any })}>
          <SelectTrigger className="w-full lg:w-[140px] h-9 text-sm border-border/60 bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        )}

        {/* Export */}
        <Button onClick={onExport} size="sm" className="h-9 px-4 text-sm">
          <Download className="h-3.5 w-3.5 mr-2" />
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

const BulkActionsBar = ({ selectedCount, onAcknowledge, onResolve, onDelete, onDeselectAll }: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledge}
            className="h-8 px-3 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
            Acknowledge
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResolve}
            className="h-8 px-3 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
          >
            <XSquare className="h-3.5 w-3.5 mr-1.5" />
            Resolve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-8 px-3 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
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
  onDelete,
}: AlertsAdvancedTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':           comparison = a.id.localeCompare(b.id); break;
        case 'timestamp':    comparison = a.timestamp.getTime() - b.timestamp.getTime(); break;
        case 'severity':     comparison = severityOrder[a.severity] - severityOrder[b.severity]; break;
        case 'confidenceScore': comparison = a.confidenceScore - b.confidenceScore; break;
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
      onSelectionChange([...new Set([...selectedIds, ...paginatedAlerts.map(a => a.id)])]);
    }
  };

  const handleSelectOne = (alertId: string) => {
    onSelectionChange(
      selectedIds.includes(alertId)
        ? selectedIds.filter(id => id !== alertId)
        : [...selectedIds, alertId]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
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
    if (sortField !== field) return <ChevronUp className="h-3 w-3 ml-1 opacity-20" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const SortableHead = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors px-4"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent bg-muted/30">
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected && !allSelected ? 'opacity-50' : ''}
                />
              </TableHead>
              <SortableHead field="id">Alert ID</SortableHead>
              <SortableHead field="timestamp">Timestamp</SortableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Source IP</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Dest IP</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Threat Type</TableHead>
              <SortableHead field="severity">Severity</SortableHead>
              <SortableHead field="confidenceScore">Confidence</SortableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Shield className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">No alerts found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAlerts.map((alert) => {
                const ThreatIcon = (threatIcons as any)[alert.threatCategory] || Shield;
                const isSelected = selectedIds.includes(alert.id);
                return (
                  <TableRow
                    key={alert.id}
                    className={cn(
                      'border-border/40 transition-colors',
                      isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectOne(alert.id)}
                        aria-label={`Select ${alert.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-primary px-4 py-3">
                      {alert.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap px-4 py-3">
                      {format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">{alert.sourceIp}</span>
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
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">{alert.destinationIp}</span>
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
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ThreatIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground">{alert.threatType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn('capitalize text-xs border rounded-full px-2 py-0.5', severityStyles[alert.severity])}
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={alert.confidenceScore} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 shrink-0">
                          {alert.confidenceScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={cn('capitalize text-xs rounded-full px-2 py-0.5', statusStyles[alert.status])}
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(alert)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {alert.status === 'open' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onAcknowledge(alert)}
                            className="h-7 w-7 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(alert)}
                          className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, sortedAlerts.length)} of {sortedAlerts.length} alerts
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-[72px] h-7 text-xs border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 rounded-lg border-border/60"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
            if (page > totalPages) return null;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'h-7 w-7 p-0 rounded-lg text-xs',
                  currentPage !== page && 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 rounded-lg border-border/60"
          >
            <ChevronRight className="h-3.5 w-3.5" />
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

const AlertDetailModal = ({ alert, open, onOpenChange, onAcknowledge, onResolve }: AlertDetailModalProps) => {
  const [notes, setNotes] = useState('');

  if (!alert) return null;

  const ThreatIcon = (threatIcons as any)[alert.threatCategory] || Shield;

  const handleSaveNotes    = () => { toast.success('Notes saved successfully'); setNotes(''); };
  const handleAddToBlocklist = () => toast.success(`${alert.sourceIp} added to blocklist`);
  const handleGenerateReport = () => toast.success('Report generation started');

  // Reusable detail row
  const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <>
      <div className="flex items-center justify-between py-2.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-sm font-medium text-foreground text-right">{children}</div>
      </div>
      <div className="border-t border-border/40 last:hidden" />
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-card border-border/60">

        {/* Modal Header */}
        <DialogHeader className="px-6 py-5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-base font-semibold text-foreground font-mono">
                {alert.id}
              </DialogTitle>
              <Badge variant="outline" className={cn('capitalize text-xs border rounded-full px-2 py-0.5', severityStyles[alert.severity])}>
                {alert.severity}
              </Badge>
              <Badge variant="secondary" className={cn('capitalize text-xs rounded-full px-2 py-0.5', statusStyles[alert.status])}>
                {alert.status}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(alert.timestamp, "MMM dd, yyyy 'at' HH:mm:ss")}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-5">

              {/* Network Details */}
              <div className="rounded-xl border border-border/60 bg-background p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-muted">
                    <Network className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Network Details</h3>
                </div>
                <div>
                  <DetailRow label="Source IP">
                    <span className="font-mono">{alert.sourceIp}:{alert.sourcePort}</span>
                  </DetailRow>
                  <DetailRow label="Destination IP">
                    <span className="font-mono">{alert.destinationIp}:{alert.destinationPort}</span>
                  </DetailRow>
                  <DetailRow label="Protocol">
                    <Badge variant="outline" className="font-mono text-xs">{alert.protocol}</Badge>
                  </DetailRow>
                  <DetailRow label="Packet Count">
                    <span className="font-mono">{alert.packetCount.toLocaleString()}</span>
                  </DetailRow>
                  <DetailRow label="Byte Count">
                    <span className="font-mono">{formatBytes(alert.byteCount)}</span>
                  </DetailRow>
                </div>
              </div>

              {/* Threat Details */}
              <div className="rounded-xl border border-border/60 bg-background p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-muted">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Threat Details</h3>
                </div>

                <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/40">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ThreatIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{alert.threatType}</p>
                    <p className="text-xs text-muted-foreground capitalize">{alert.threatCategory}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                    <span className="text-xl font-bold text-primary">{alert.confidenceScore}%</span>
                  </div>
                  <Progress value={alert.confidenceScore} className="h-2" />
                </div>

                <div>
                  <DetailRow label="Model Used">{alert.modelUsed}</DetailRow>
                  <DetailRow label="Detection Method">{alert.detectionMethod}</DetailRow>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* Timeline */}
              <div className="rounded-xl border border-border/60 bg-background p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { time: alert.timestamp, label: 'Created', icon: Clock, color: 'bg-blue-500/10 text-blue-500' },
                    ...(alert.acknowledgedAt ? [{ time: alert.acknowledgedAt, label: 'Acknowledged', icon: Check, color: 'bg-amber-500/10 text-amber-500' }] : []),
                    ...(alert.resolvedAt ? [{ time: alert.resolvedAt, label: 'Resolved', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500' }] : []),
                  ].map(({ time, label, icon: Icon, color }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className={cn('p-1.5 rounded-full shrink-0', color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(time, "MMM dd, yyyy 'at' HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-xl border border-border/60 bg-background p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(alert)}
                    disabled={alert.status !== 'open'}
                    className="h-9 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Acknowledge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolve(alert)}
                    disabled={alert.status === 'resolved'}
                    className="h-9 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToBlocklist}
                    className="h-9 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                    Add to Blocklist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateReport}
                    className="h-9 text-xs border-border/60"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-border/60 bg-background p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Notes</h3>

                {alert.notes && alert.notes.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {alert.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-muted/40 border border-border/40">
                        <p className="text-sm text-foreground">{note.content}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                          {note.author} · {format(note.timestamp, 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Textarea
                  placeholder="Add a note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] text-sm bg-background border-border/60 mb-3 resize-none"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={!notes.trim()}
                  className="w-full h-9 text-sm"
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 text-sm border-border/60">
            <X className="h-3.5 w-3.5 mr-1.5" />
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (alert.status === 'open') onAcknowledge(alert);
              else if (alert.status === 'acknowledged') onResolve(alert);
              onOpenChange(false);
            }}
            disabled={alert.status === 'resolved'}
            className="h-9 text-sm"
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
        const q = filters.search.toLowerCase();
        if (
          !alert.sourceIp.toLowerCase().includes(q) &&
          !alert.destinationIp.toLowerCase().includes(q) &&
          !alert.threatType.toLowerCase().includes(q) &&
          !alert.id.toLowerCase().includes(q)
        ) return false;
      }
      if (filters.dateFrom && alert.timestamp < filters.dateFrom) return false;
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        if (alert.timestamp > end) return false;
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
          <span>New alert: {newAlerts[0].threatType}</span>
        </div>,
        { duration: 3000 }
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, alerts.length]);

  useEffect(() => {
    if (autoRefresh) setLiveCount(alerts.length);
  }, [alerts.length, autoRefresh]);

  const handleExport = useCallback(() => {
    const headers = ['ID', 'Timestamp', 'Source IP', 'Destination IP', 'Threat Type', 'Severity', 'Status', 'Confidence'];
    const rows = filteredAlerts.map(a => [
      a.id, a.timestamp.toISOString(), a.sourceIp, a.destinationIp,
      a.threatType, a.severity, a.status, a.confidenceScore
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `alerts-export-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Alerts exported successfully');
  }, [filteredAlerts]);

  const handleViewDetails   = (alert: Alert) => { setSelectedAlert(alert); setDetailModalOpen(true); };
  const handleAcknowledge   = (alert: Alert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date() } : a));
    toast.success(`Alert ${alert.id} acknowledged`);
  };
  const handleResolve       = (alert: Alert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'resolved' as const, resolvedAt: new Date() } : a));
    toast.success(`Alert ${alert.id} resolved`);
  };
  const handleDelete        = (alert: Alert) => {
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
    setSelectedIds(prev => prev.filter(id => id !== alert.id));
    toast.success(`Alert ${alert.id} deleted`);
  };
  const handleBulkAcknowledge = () => {
    setAlerts(prev => prev.map(a => selectedIds.includes(a.id) && a.status === 'open' ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date() } : a));
    toast.success(`${selectedIds.length} alerts acknowledged`);
    setSelectedIds([]);
  };
  const handleBulkResolve = () => {
    setAlerts(prev => prev.map(a => selectedIds.includes(a.id) && a.status !== 'resolved' ? { ...a, status: 'resolved' as const, resolvedAt: new Date() } : a));
    toast.success(`${selectedIds.length} alerts resolved`);
    setSelectedIds([]);
  };
  const handleBulkDelete = () => {
    setAlerts(prev => prev.filter(a => !selectedIds.includes(a.id)));
    toast.success(`${selectedIds.length} alerts deleted`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Security Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor security incidents</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className={cn('h-3.5 w-3.5', autoRefresh ? 'animate-spin text-primary' : 'text-muted-foreground')} />
            <span className="text-muted-foreground">
              Live: <span className="font-mono text-foreground">{liveCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground cursor-pointer">
              Auto-refresh
            </Label>
          </div>
        </div>
      </div>

      <AlertFiltersBar filters={filters} onFiltersChange={setFilters} onExport={handleExport} />

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