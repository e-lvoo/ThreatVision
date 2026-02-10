import { format } from 'date-fns';
import { Activity, Download, Eye, RotateCcw, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MLModel } from '@/types/models';
import { cn } from '@/lib/utils';

interface ActiveModelCardProps {
  model: MLModel;
  onViewDetails: (model: MLModel) => void;
  onRollback: (model: MLModel) => void;
  onDownload: (model: MLModel) => void;
}

const MetricBox = ({ 
  label, 
  value, 
  suffix = '%', 
  trend,
  variant = 'default' 
}: { 
  label: string; 
  value: number; 
  suffix?: string;
  trend?: { timestamp: string; value: number }[];
  variant?: 'default' | 'danger';
}) => (
  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {trend && trend.length > 0 && (
        <TrendingUp className="h-3 w-3 text-green-400" />
      )}
    </div>
    <div className="flex items-end gap-2">
      <span className={cn(
        'text-2xl font-bold',
        variant === 'danger' ? 'text-red-400' : 'text-foreground'
      )}>
        {value.toFixed(1)}{suffix}
      </span>
      {trend && trend.length > 0 && (
        <div className="h-8 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);

const ActiveModelCard = ({ model, onViewDetails, onRollback, onDownload }: ActiveModelCardProps) => {
  return (
    <div className="glass-card rounded-xl p-6 border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
      {/* Pulsing glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse-subtle">
              <Activity className="h-3 w-3 mr-1" />
              Currently Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Running</span>
          </div>
        </div>

        {/* Model Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">{model.name}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Version: <span className="text-foreground font-medium">{model.version}</span></span>
            <span>•</span>
            <span>Deployed: <span className="text-foreground font-medium">{format(model.deploymentDate!, 'MMM dd, yyyy')}</span></span>
            <span>•</span>
            <span>Architecture: <span className="text-foreground font-medium">{model.architecture}</span></span>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <MetricBox 
            label="Accuracy" 
            value={model.metrics.accuracy} 
            trend={model.metricsTrend}
          />
          <MetricBox 
            label="Precision" 
            value={model.metrics.precision} 
          />
          <MetricBox 
            label="Recall" 
            value={model.metrics.recall} 
          />
          <MetricBox 
            label="F1-Score" 
            value={model.metrics.f1Score} 
          />
          <MetricBox 
            label="False Positive Rate" 
            value={model.metrics.falsePositiveRate} 
            variant="danger"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onViewDetails(model)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="destructive" onClick={() => onRollback(model)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Roll Back
          </Button>
          <Button variant="outline" onClick={() => onDownload(model)}>
            <Download className="h-4 w-4 mr-2" />
            Download Model
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveModelCard;
