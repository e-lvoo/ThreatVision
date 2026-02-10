import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, Loader2, CheckCircle2, XCircle, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrainingJob } from '@/types/models';
import { cn } from '@/lib/utils';

interface TrainingJobsSectionProps {
  jobs: TrainingJob[];
  onPause: (job: TrainingJob) => void;
  onResume: (job: TrainingJob) => void;
  onCancel: (job: TrainingJob) => void;
}

const statusConfig = {
  running: { 
    label: 'Running', 
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  queued: { 
    label: 'Queued', 
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <Clock className="h-3 w-3" />
  },
  completed: { 
    label: 'Completed', 
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  failed: { 
    label: 'Failed', 
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="h-3 w-3" />
  },
};

const TrainingJobsSection = ({ jobs, onPause, onResume, onCancel }: TrainingJobsSectionProps) => {
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);

  const toggleExpand = (jobId: string) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');
  const recentJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed').slice(0, 3);

  return (
    <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Training Jobs</h3>
            <p className="text-sm text-muted-foreground">Active and recent training runs</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {activeJobs.length} Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {[...activeJobs, ...recentJobs].map((job) => {
          const status = statusConfig[job.status];
          const isExpanded = expandedJobs.includes(job.id);

          return (
            <Collapsible key={job.id} open={isExpanded} onOpenChange={() => toggleExpand(job.id)}>
              <div className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={cn('gap-1', status.className)}>
                      {status.icon}
                      {status.label}
                    </Badge>
                    <span className="font-medium text-foreground">{job.modelName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{job.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'running' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onPause(job)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onCancel(job)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {job.status === 'queued' && (
                      <Button variant="ghost" size="sm" onClick={() => onCancel(job)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>Started: {format(job.startTime, 'MMM dd, HH:mm')}</span>
                  {job.eta && <span>ETA: {job.eta}</span>}
                  <span>Epochs: {job.currentEpoch}/{job.epochs}</span>
                </div>

                {(job.status === 'running' || job.status === 'queued') && (
                  <div className="flex items-center gap-3">
                    <Progress value={job.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-foreground w-12">{job.progress}%</span>
                  </div>
                )}

                <CollapsibleContent>
                  <div className="mt-4 p-3 rounded-lg bg-cyber-dark border border-border/30 font-mono text-xs">
                    <div className="max-h-48 overflow-y-auto scrollbar-cyber space-y-1">
                      {job.logs.map((log, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            'text-muted-foreground',
                            log.includes('ERROR') && 'text-red-400',
                            log.includes('SUCCESS') || log.includes('completed') && 'text-green-400',
                            log.includes('Epoch') && 'text-blue-400'
                          )}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {jobs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No training jobs found
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingJobsSection;
