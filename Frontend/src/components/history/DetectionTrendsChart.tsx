import { Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { TimeSeriesDataPoint } from '@/types/history';

interface DetectionTrendsChartProps {
  data: TimeSeriesDataPoint[];
  onDownload: () => void;
}

const DetectionTrendsChart = ({ data, onDownload }: DetectionTrendsChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium text-foreground">
                {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Detection Trends</h3>
          <p className="text-sm text-muted-foreground">Malicious vs Benign detections over time</p>
        </div>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download Chart
        </Button>
      </div>
      
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="maliciousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benignGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="hsl(215, 20%, 65%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-foreground capitalize">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="malicious"
              stackId="1"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fill="url(#maliciousGradient)"
            />
            <Area
              type="monotone"
              dataKey="benign"
              stackId="1"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="url(#benignGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DetectionTrendsChart;
