import { useState } from 'react';
import { Eye, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Alert, Severity, AlertStatus } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AlertsTableProps {
  alerts: Alert[];
  onViewDetails?: (alert: Alert) => void;
  onAcknowledge?: (alert: Alert) => void;
}

const ITEMS_PER_PAGE = 10;

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

const AlertsTable = ({ alerts, onViewDetails, onAcknowledge }: AlertsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAlerts = alerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="glass-card rounded-xl border border-border/30">
      <div className="p-5 border-b border-border/30">
        <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">Latest security alerts requiring attention</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Source IP</TableHead>
              <TableHead className="text-muted-foreground">Threat Type</TableHead>
              <TableHead className="text-muted-foreground">Severity</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow 
                key={alert.id} 
                className="border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(alert.timestamp, 'MMM dd, HH:mm:ss')}
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground">
                  {alert.sourceIp}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {alert.threatType}
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
                  <Badge 
                    variant="secondary" 
                    className={cn('capitalize', statusStyles[alert.status])}
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(alert)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {alert.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAcknowledge?.(alert)}
                        className="text-yellow-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Ack
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t border-border/30 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, alerts.length)} of {alerts.length} alerts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}
            >
              {page}
            </Button>
          ))}
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

export default AlertsTable;
