import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConfusionMatrixData, ROCPoint, PrecisionRecallPoint, FeatureImportance } from '@/types/models';
import { cn } from '@/lib/utils';

interface ModelPerformanceDashboardProps {
  confusionMatrix: ConfusionMatrixData;
  rocCurve: ROCPoint[];
  precisionRecall: PrecisionRecallPoint[];
  featureImportance: FeatureImportance[];
}

const ConfusionMatrix = ({ data }: { data: ConfusionMatrixData }) => {
  const total = data.truePositive + data.trueNegative + data.falsePositive + data.falseNegative;
  
  const cells = [
    { label: 'True Positive', value: data.truePositive, color: 'bg-green-500/40', row: 0, col: 1 },
    { label: 'False Negative', value: data.falseNegative, color: 'bg-red-500/30', row: 0, col: 0 },
    { label: 'False Positive', value: data.falsePositive, color: 'bg-red-500/30', row: 1, col: 1 },
    { label: 'True Negative', value: data.trueNegative, color: 'bg-green-500/40', row: 1, col: 0 },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Confusion Matrix</h4>
      <div className="relative">
        <div className="grid grid-cols-2 gap-1 max-w-xs mx-auto">
          {/* Header row */}
          <div className="col-span-2 grid grid-cols-3 mb-1">
            <div />
            <div className="text-center text-xs text-muted-foreground">Predicted Negative</div>
            <div className="text-center text-xs text-muted-foreground">Predicted Positive</div>
          </div>
          
          {/* Actual Positive row */}
          <div className="flex items-center justify-end pr-2">
            <span className="text-xs text-muted-foreground">Actual Positive</span>
          </div>
          <div className="grid grid-cols-2 gap-1 col-span-1">
            <div className={cn('p-4 rounded text-center', 'bg-red-500/30')}>
              <span className="text-lg font-bold text-foreground">{data.falseNegative}</span>
              <p className="text-xs text-muted-foreground">FN</p>
            </div>
            <div className={cn('p-4 rounded text-center', 'bg-green-500/40')}>
              <span className="text-lg font-bold text-foreground">{data.truePositive}</span>
              <p className="text-xs text-muted-foreground">TP</p>
            </div>
          </div>
          
          {/* Actual Negative row */}
          <div className="flex items-center justify-end pr-2">
            <span className="text-xs text-muted-foreground">Actual Negative</span>
          </div>
          <div className="grid grid-cols-2 gap-1 col-span-1">
            <div className={cn('p-4 rounded text-center', 'bg-green-500/40')}>
              <span className="text-lg font-bold text-foreground">{data.trueNegative}</span>
              <p className="text-xs text-muted-foreground">TN</p>
            </div>
            <div className={cn('p-4 rounded text-center', 'bg-red-500/30')}>
              <span className="text-lg font-bold text-foreground">{data.falsePositive}</span>
              <p className="text-xs text-muted-foreground">FP</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Total samples: {total.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-2 border border-border/50 shadow-xl text-sm">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-foreground">{entry.value.toFixed(3)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ModelPerformanceDashboard = ({ 
  confusionMatrix, 
  rocCurve, 
  precisionRecall, 
  featureImportance 
}: ModelPerformanceDashboardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Add diagonal reference line for ROC
  const rocWithDiagonal = [
    { fpr: 0, tpr: 0, diagonal: 0 },
    ...rocCurve.map(p => ({ ...p, diagonal: p.fpr })),
    { fpr: 1, tpr: 1, diagonal: 1 },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Model Performance Dashboard</h3>
              <p className="text-sm text-muted-foreground">Detailed metrics and visualizations</p>
            </div>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-5 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <ConfusionMatrix data={confusionMatrix} />
            </div>

            {/* ROC Curve */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-4">ROC Curve</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocWithDiagonal} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                    <XAxis 
                      dataKey="fpr" 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{ value: 'False Positive Rate', position: 'bottom', fontSize: 10, fill: 'hsl(215, 20%, 65%)' }}
                    />
                    <YAxis 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(215, 20%, 65%)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="diagonal" stroke="hsl(217, 33%, 30%)" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="tpr" stroke="hsl(186, 100%, 50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">AUC = 0.982</p>
            </div>

            {/* Precision-Recall Curve */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-4">Precision-Recall Curve</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={precisionRecall} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                    <XAxis 
                      dataKey="recall" 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{ value: 'Recall', position: 'bottom', fontSize: 10, fill: 'hsl(215, 20%, 65%)' }}
                    />
                    <YAxis 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      domain={[0.8, 1]}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(215, 20%, 65%)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="precision" stroke="hsl(270, 60%, 50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Average Precision = 0.967</p>
            </div>

            {/* Feature Importance */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-4">Feature Importance</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 5, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="feature" 
                      stroke="hsl(215, 20%, 65%)" 
                      fontSize={10}
                      width={55}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(222, 47%, 8%)', 
                        border: '1px solid hsl(217, 33%, 20%)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {featureImportance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(186, ${100 - index * 10}%, ${50 - index * 3}%)`} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ModelPerformanceDashboard;
