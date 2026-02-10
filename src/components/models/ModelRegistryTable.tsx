import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, Archive, GitCompare, Loader2, Play, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MLModel, ModelStatus } from '@/types/models';
import { cn } from '@/lib/utils';

interface ModelRegistryTableProps {
  models: MLModel[];
  onDeploy: (model: MLModel) => void;
  onViewMetrics: (model: MLModel) => void;
  onCompare: (model: MLModel) => void;
  onArchive: (model: MLModel) => void;
  onDelete: (model: MLModel) => void;
}

const statusConfig: Record<ModelStatus, { label: string; className: string; icon?: React.ReactNode }> = {
  active: { label: 'Active', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-muted' },
  training: { label: 'Training', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const ModelRegistryTable = ({ 
  models, 
  onDeploy, 
  onViewMetrics, 
  onCompare, 
  onArchive, 
  onDelete 
}: ModelRegistryTableProps) => {
  const [sortField, setSortField] = useState<'accuracy' | 'trainingDate'>('trainingDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'accuracy' | 'trainingDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'accuracy') {
      return (a.metrics.accuracy - b.metrics.accuracy) * multiplier;
    }
    return (a.trainingDate.getTime() - b.trainingDate.getTime()) * multiplier;
  });

  return (
    <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <h3 className="text-lg font-semibold text-foreground">Model Registry</h3>
        <p className="text-sm text-muted-foreground">All trained models and their performance</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Model Name</TableHead>
              <TableHead className="text-muted-foreground">Version</TableHead>
              <TableHead className="text-muted-foreground">Architecture</TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('trainingDate')}
              >
                <div className="flex items-center gap-1">
                  Training Date
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('accuracy')}
              >
                <div className="flex items-center gap-1">
                  Accuracy
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedModels.map((model) => {
              const status = statusConfig[model.status];
              return (
                <TableRow 
                  key={model.id} 
                  className="border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{model.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{model.version}</TableCell>
                  <TableCell className="text-muted-foreground">{model.architecture}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(model.trainingDate, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {model.status !== 'training' && model.metrics.accuracy > 0 ? (
                      <span className={cn(
                        'font-medium',
                        model.metrics.accuracy >= 95 ? 'text-green-400' :
                        model.metrics.accuracy >= 90 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {model.metrics.accuracy.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('gap-1', status.className)}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {model.status !== 'active' && model.status !== 'training' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeploy(model)}
                          className="h-8 px-2"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewMetrics(model)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onCompare(model)}
                        className="h-8 px-2"
                      >
                        <GitCompare className="h-4 w-4" />
                      </Button>
                      {model.status !== 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onArchive(model)}
                          className="h-8 px-2"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      {model.status !== 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDelete(model)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ModelRegistryTable;
