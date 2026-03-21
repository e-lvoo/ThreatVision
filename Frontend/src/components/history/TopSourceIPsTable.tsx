import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SourceIPData } from '@/types/history';
import { cn } from '@/lib/utils';

interface TopSourceIPsTableProps {
  data: SourceIPData[];
  onViewFullList: () => void;
}

const TopSourceIPsTable = ({ data, onViewFullList }: TopSourceIPsTableProps) => {
  const maxCount = Math.max(...data.map(d => d.detectionsCount));

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Source IPs</h3>
          <p className="text-sm text-muted-foreground">Most active source addresses</p>
        </div>
        <Button variant="outline" size="sm" onClick={onViewFullList}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full List
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Source IP</TableHead>
              <TableHead className="text-muted-foreground">Detections</TableHead>
              <TableHead className="text-muted-foreground">Malicious %</TableHead>
              <TableHead className="text-muted-foreground">Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((ip, index) => (
              <TableRow 
                key={ip.ip} 
                className="border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm text-foreground">
                  {ip.ip}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-12">
                      {ip.detectionsCount}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${(ip.detectionsCount / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'text-sm font-medium',
                    ip.maliciousPercentage >= 70 ? 'text-red-400' :
                    ip.maliciousPercentage >= 40 ? 'text-yellow-400' : 'text-green-400'
                  )}>
                    {ip.maliciousPercentage}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(ip.lastSeen, 'MMM dd, HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TopSourceIPsTable;
