import { useState } from 'react';
import { Search, Calendar, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AlertFilters, Severity, AlertStatus } from '@/types/dashboard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertFiltersBarProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  onExport: () => void;
}

const AlertFiltersBar = ({ filters, onFiltersChange, onExport }: AlertFiltersBarProps) => {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      dateFrom: null,
      dateTo: null,
      severity: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.dateFrom !== null || 
    filters.dateTo !== null || 
    filters.severity !== 'all' || 
    filters.status !== 'all';

  return (
    <div className="glass-card rounded-xl border border-border/30 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP, threat type..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>

        {/* Date From */}
        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full lg:w-[160px] justify-start text-left font-normal bg-background/50 border-border/50",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom || undefined}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateFrom: date || null });
                setDateFromOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full lg:w-[160px] justify-start text-left font-normal bg-background/50 border-border/50",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo || undefined}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateTo: date || null });
                setDateToOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Severity Filter */}
        <Select
          value={filters.severity}
          onValueChange={(value) => onFiltersChange({ ...filters, severity: value as Severity | 'all' })}
        >
          <SelectTrigger className="w-full lg:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as AlertStatus | 'all' })}
        >
          <SelectTrigger className="w-full lg:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Export */}
        <Button onClick={onExport} className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default AlertFiltersBar;
