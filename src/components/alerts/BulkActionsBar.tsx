import { CheckSquare, XSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onAcknowledge: () => void;
  onResolve: () => void;
  onDelete: () => void;
  onDeselectAll: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onAcknowledge,
  onResolve,
  onDelete,
  onDeselectAll,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="glass-card rounded-xl border border-primary/30 bg-primary/5 p-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledge}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-400"
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Acknowledge Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResolve}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-400"
          >
            <XSquare className="h-4 w-4 mr-1" />
            Resolve Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
