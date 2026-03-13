import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceGaugesProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  f1Trend: number;
}

const GaugeChart = ({ 
  value, 
  label, 
  target = 95,
  size = 120 
}: { 
  value: number; 
  label: string; 
  target?: number;
  size?: number;
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const progress = (value / 100) * circumference;
  const meetsTarget = value >= target;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 10} className="transform -rotate-0">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="hsl(217, 33%, 17%)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={meetsTarget ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Value display */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className={cn(
            'text-2xl font-bold',
            meetsTarget ? 'text-green-400' : 'text-red-400'
          )}>
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Target: ≥{target}%</p>
      </div>
    </div>
  );
};

const PerformanceGauges = ({ accuracy, precision, recall, f1Score, f1Trend }: PerformanceGaugesProps) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Detection Performance Metrics</h3>
        <p className="text-sm text-muted-foreground">Model accuracy and performance indicators</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeChart value={accuracy} label="Accuracy" target={95} />
        <GaugeChart value={precision} label="Precision" target={93} />
        <GaugeChart value={recall} label="Recall" target={90} />
        
        {/* F1 Score Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-sm text-muted-foreground mb-2">F1 Score</p>
          <p className="text-4xl font-bold text-foreground">{f1Score.toFixed(1)}%</p>
          <div className={cn(
            'flex items-center gap-1 mt-2 text-sm font-medium',
            f1Trend >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {f1Trend >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{f1Trend >= 0 ? '+' : ''}{f1Trend.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs last period</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceGauges;
