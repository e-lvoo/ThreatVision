import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ThreatTypeDistribution } from '@/types/history';

interface ThreatTypeChartProps {
  data: ThreatTypeDistribution[];
}

const ThreatTypeChart = ({ data }: ThreatTypeChartProps) => {
  const totalMalicious = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-medium text-foreground">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.08) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Threat Type Distribution</h3>
        <p className="text-sm text-muted-foreground">Breakdown by malware category</p>
      </div>
      
      <div className="h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ right: 0, paddingLeft: '20px' }}
              formatter={(value, entry: any) => (
                <span className="text-sm text-foreground">
                  {value} <span className="text-muted-foreground">({entry.payload.value})</span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-2xl font-bold text-foreground">{totalMalicious}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );
};

export default ThreatTypeChart;
