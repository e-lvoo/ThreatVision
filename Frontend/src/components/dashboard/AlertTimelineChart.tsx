import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { TimelineDataPoint } from '@/types/dashboard';

interface AlertTimelineChartProps {
  data: TimelineDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-border/50">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AlertTimelineChart = ({ data }: AlertTimelineChartProps) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Alert Timeline</h3>
        <p className="text-sm text-muted-foreground">Alerts over the last 7 days by severity</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-muted-foreground capitalize">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorCritical)"
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#colorHigh)"
            />
            <Area
              type="monotone"
              dataKey="medium"
              stroke="#eab308"
              strokeWidth={2}
              fill="url(#colorMedium)"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorLow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlertTimelineChart;
