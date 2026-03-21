import { useState, useMemo } from 'react';
import { 
  Eye, 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Copy,
  Bug,
  Shield,
  Skull,
  AlertTriangle,
  Zap,
  Target,
  Crosshair,
  Lock
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, Severity, AlertStatus, ThreatCategory } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AlertsAdvancedTableProps {
  alerts: Alert[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewDetails: (alert: Alert) => void;
  onAcknowledge: (alert: Alert) => void;
  onDelete: (alert: Alert) => void;
}

type SortField = 'id' | 'timestamp' | 'severity' | 'confidenceScore';
type SortDirection = 'asc' | 'desc';

const threatIcons: Record<ThreatCategory, React.ElementType> = {
  virus: Bug,
  trojan: Skull,
  worm: Target,
  ransomware: Lock,
  ddos: Zap,
  phishing: AlertTriangle,
  injection: Crosshair,
  bruteforce: Shield,
};

const severityStyles: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusStyles: Record<AlertStatus, string> = {
  open: 'bg-red-500/20 text-red-400',
  acknowledged: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
};

const severityOrder: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

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
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
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
                const ThreatIcon = threatIcons[alert.threatCategory] || Shield;
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
                        className={cn('capitalize border', severityStyles[alert.severity])}
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
                        className={cn('capitalize', statusStyles[alert.status])}
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
      
      {/* Pagination */}
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
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}
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
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsAdvancedTable;
