import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ModelPerformanceMetrics } from '@/types/history';

interface ModelPerformanceChartProps {
  data: ModelPerformanceMetrics[];
}

const ModelPerformanceChart = ({ data }: ModelPerformanceChartProps) => {
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
              <span className="font-medium text-foreground">{entry.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Model Performance Over Time</h3>
        <p className="text-sm text-muted-foreground">Tracking detection accuracy metrics</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              domain={[80, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-foreground capitalize">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="precision"
              stroke="hsl(200, 98%, 39%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="recall"
              stroke="hsl(25, 95%, 53%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="f1Score"
              stroke="hsl(270, 60%, 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelPerformanceChart;
