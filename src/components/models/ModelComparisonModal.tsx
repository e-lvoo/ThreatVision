import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MLModel } from '@/types/models';
import { cn } from '@/lib/utils';

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: MLModel[];
  initialModel?: MLModel;
  onSelectBest: (model: MLModel) => void;
}

const colors = ['hsl(186, 100%, 50%)', 'hsl(270, 60%, 50%)', 'hsl(142, 76%, 36%)'];

const ModelComparisonModal = ({ isOpen, onClose, models, initialModel, onSelectBest }: ModelComparisonModalProps) => {
  const [selectedModels, setSelectedModels] = useState<(MLModel | null)[]>([
    initialModel || null,
    null,
    null,
  ]);

  const availableModels = models.filter(m => m.status !== 'training');

  const handleSelectModel = (index: number, modelId: string) => {
    const model = models.find(m => m.id === modelId) || null;
    const newSelection = [...selectedModels];
    newSelection[index] = model;
    setSelectedModels(newSelection);
  };

  const activeComparisons = selectedModels.filter(m => m !== null) as MLModel[];

  const radarData = [
    { metric: 'Accuracy', fullMark: 100 },
    { metric: 'Precision', fullMark: 100 },
    { metric: 'Recall', fullMark: 100 },
    { metric: 'F1-Score', fullMark: 100 },
    { metric: 'Speed', fullMark: 100 },
  ].map(item => {
    const dataPoint: any = { ...item };
    activeComparisons.forEach((model, index) => {
      const speedScore = Math.max(0, 100 - model.metrics.inferenceSpeed * 2);
      dataPoint[`model${index}`] = 
        item.metric === 'Accuracy' ? model.metrics.accuracy :
        item.metric === 'Precision' ? model.metrics.precision :
        item.metric === 'Recall' ? model.metrics.recall :
        item.metric === 'F1-Score' ? model.metrics.f1Score :
        speedScore;
    });
    return dataPoint;
  });

  const findBestModel = () => {
    if (activeComparisons.length === 0) return null;
    return activeComparisons.reduce((best, current) => 
      current.metrics.f1Score > best.metrics.f1Score ? current : best
    );
  };

  const bestModel = findBestModel();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Compare Models</DialogTitle>
        </DialogHeader>

        {/* Model Selection */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm text-muted-foreground">Model {index + 1}</label>
              <Select
                value={selectedModels[index]?.id || ''}
                onValueChange={(value) => handleSelectModel(index, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem 
                      key={model.id} 
                      value={model.id}
                      disabled={selectedModels.some((m, i) => i !== index && m?.id === model.id)}
                    >
                      {model.name} {model.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {activeComparisons.length > 0 && (
          <>
            {/* Radar Chart */}
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(217, 33%, 20%)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                  />
                  {activeComparisons.map((model, index) => (
                    <Radar
                      key={model.id}
                      name={`${model.name} ${model.version}`}
                      dataKey={`model${index}`}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 8%)', 
                      border: '1px solid hsl(217, 33%, 20%)',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Metric</th>
                    {activeComparisons.map((model, index) => (
                      <th key={model.id} className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: colors[index] }}
                          />
                          <span className="text-foreground font-medium">{model.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{model.version}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Accuracy', key: 'accuracy', suffix: '%' },
                    { label: 'Precision', key: 'precision', suffix: '%' },
                    { label: 'Recall', key: 'recall', suffix: '%' },
                    { label: 'F1-Score', key: 'f1Score', suffix: '%' },
                    { label: 'False Positive Rate', key: 'falsePositiveRate', suffix: '%', inverted: true },
                    { label: 'Inference Speed', key: 'inferenceSpeed', suffix: 'ms', inverted: true },
                    { label: 'Model Size', key: 'modelSize', suffix: 'MB', inverted: true },
                  ].map((row) => {
                    const values = activeComparisons.map(m => (m.metrics as any)[row.key]);
                    const bestValue = row.inverted ? Math.min(...values) : Math.max(...values);
                    
                    return (
                      <tr key={row.key} className="border-b border-border/30">
                        <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                        {activeComparisons.map((model, index) => {
                          const value = (model.metrics as any)[row.key];
                          const isBest = value === bestValue && activeComparisons.length > 1;
                          return (
                            <td key={model.id} className="text-center py-3 px-4">
                              <span className={cn(
                                'font-medium',
                                isBest ? 'text-green-400' : 'text-foreground'
                              )}>
                                {typeof value === 'number' ? value.toFixed(1) : value}{row.suffix}
                              </span>
                              {isBest && <Check className="inline-block h-4 w-4 ml-1 text-green-400" />}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="border-b border-border/30">
                    <td className="py-3 px-4 text-muted-foreground">Training Dataset</td>
                    {activeComparisons.map((model) => (
                      <td key={model.id} className="text-center py-3 px-4 text-foreground">
                        {model.trainingDataset}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Dataset Size</td>
                    {activeComparisons.map((model) => (
                      <td key={model.id} className="text-center py-3 px-4 text-foreground">
                        {(model.datasetSize / 1000000).toFixed(1)}M samples
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {bestModel && (
                <Button onClick={() => onSelectBest(bestModel)}>
                  <Check className="h-4 w-4 mr-2" />
                  Deploy {bestModel.name} {bestModel.version}
                </Button>
              )}
            </div>
          </>
        )}

        {activeComparisons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Select at least one model to compare
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelComparisonModal;
