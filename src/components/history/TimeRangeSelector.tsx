import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimeRange, DateRange } from '@/types/history';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  customRange: DateRange;
  onRangeChange: (range: TimeRange) => void;
  onCustomRangeChange: (range: DateRange) => void;
  onApply: () => void;
}

const TimeRangeSelector = ({
  selectedRange,
  customRange,
  onRangeChange,
  onCustomRangeChange,
  onApply,
}: TimeRangeSelectorProps) => {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: 'Last 24h' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="glass-card rounded-xl p-4 border border-border/30">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
        
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRangeChange(range.value)}
              className={cn(
                'transition-all duration-200',
                selectedRange === range.value && 'shadow-lg shadow-primary/25'
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {selectedRange === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-[140px] justify-start text-left font-normal',
                    !customRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange.from ? format(customRange.from, 'MMM dd, yyyy') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customRange.from || undefined}
                  onSelect={(date) => {
                    onCustomRangeChange({ ...customRange, from: date || null });
                    setIsFromOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-[140px] justify-start text-left font-normal',
                    !customRange.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange.to ? format(customRange.to, 'MMM dd, yyyy') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customRange.to || undefined}
                  onSelect={(date) => {
                    onCustomRangeChange({ ...customRange, to: date || null });
                    setIsToOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Button onClick={onApply} size="sm" className="ml-auto">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default TimeRangeSelector;
