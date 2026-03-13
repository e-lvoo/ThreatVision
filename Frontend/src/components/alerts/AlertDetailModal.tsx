import { useState } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Clock, 
  Check, 
  CheckCircle2, 
  Shield, 
  Ban, 
  FileText,
  Bug,
  Skull,
  Target,
  Lock,
  Zap,
  AlertTriangle,
  Crosshair,
  Network,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, Severity, AlertStatus, ThreatCategory } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AlertDetailModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (alert: Alert) => void;
  onResolve: (alert: Alert) => void;
}

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

  const ThreatIcon = threatIcons[alert.threatCategory] || Shield;

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
                className={cn('capitalize border', severityStyles[alert.severity])}
              >
                {alert.severity}
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn('capitalize', statusStyles[alert.status])}
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
            {/* Left Column */}
            <div className="space-y-6">
              {/* Network Details */}
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

              {/* Threat Details */}
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

            {/* Right Column */}
            <div className="space-y-6">
              {/* Timeline */}
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

              {/* Actions */}
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

              {/* Notes */}
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

export default AlertDetailModal;
