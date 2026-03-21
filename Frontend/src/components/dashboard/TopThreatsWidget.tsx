import { ThreatTypeData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface TopThreatsWidgetProps {
  data: ThreatTypeData[];
  onThreatClick?: (threatName: string) => void;
}

const threatColors = [
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
];

const TopThreatsWidget = ({ data, onThreatClick }: TopThreatsWidgetProps) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Threats</h3>
        <p className="text-sm text-muted-foreground">Most common threat types detected</p>
      </div>
      
      <div className="space-y-4">
        {data.map((threat, index) => (
          <button
            key={threat.name}
            onClick={() => onThreatClick?.(threat.name)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {threat.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{threat.count}</span>
                <span className="text-xs text-muted-foreground">({threat.percentage}%)</span>
              </div>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500 group-hover:opacity-80',
                  threatColors[index % threatColors.length]
                )}
                style={{ width: `${(threat.count / maxCount) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopThreatsWidget;
