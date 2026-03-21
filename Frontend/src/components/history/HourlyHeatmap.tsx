import { HeatmapCell } from '@/types/history';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HourlyHeatmapProps {
  data: HeatmapCell[];
}

const HourlyHeatmap = ({ data }: HourlyHeatmapProps) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxValue = Math.max(...data.map(d => d.value));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity < 0.2) return 'bg-primary/10';
    if (intensity < 0.4) return 'bg-primary/25';
    if (intensity < 0.6) return 'bg-primary/45';
    if (intensity < 0.8) return 'bg-primary/65';
    return 'bg-primary/90';
  };

  const getCellData = (day: number, hour: number) => {
    return data.find(d => d.day === day && d.hour === hour);
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Detection Heatmap</h3>
        <p className="text-sm text-muted-foreground">Attack patterns by hour and day of week</p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-2 ml-12">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-muted-foreground"
                style={{ minWidth: '24px' }}
              >
                {hour % 3 === 0 ? `${hour}` : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <span className="w-12 text-xs text-muted-foreground">{day}</span>
              <div className="flex flex-1 gap-0.5">
                {hours.map((hour) => {
                  const cell = getCellData(dayIndex, hour);
                  return (
                    <Tooltip key={hour}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex-1 h-6 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/50',
                            cell ? getColor(cell.value) : 'bg-muted/30'
                          )}
                          style={{ minWidth: '20px' }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{day} at {hour}:00</p>
                        <p className="text-muted-foreground">
                          {cell?.value || 0} detections
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              {['bg-primary/10', 'bg-primary/25', 'bg-primary/45', 'bg-primary/65', 'bg-primary/90'].map((color, i) => (
                <div key={i} className={cn('w-4 h-4 rounded-sm', color)} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyHeatmap;
