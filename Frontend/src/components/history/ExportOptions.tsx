import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const ExportOptions = ({ onExportPDF, onExportCSV }: ExportOptionsProps) => {
  const handleExportPDF = () => {
    onExportPDF();
    toast({
      title: 'Export Started',
      description: 'Generating PDF report...',
    });
  };

  const handleExportCSV = () => {
    onExportCSV();
    toast({
      title: 'Export Started',
      description: 'Generating CSV data export...',
    });
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
          <p className="text-sm text-muted-foreground">Download reports and raw data</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Export Report (PDF)
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Data (CSV)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;
