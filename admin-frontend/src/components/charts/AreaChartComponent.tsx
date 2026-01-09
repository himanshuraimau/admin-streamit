import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartData {
  [key: string]: string | number;
}

interface AreaChartComponentProps {
  data: AreaChartData[];
  dataKey: string;
  xAxisKey: string;
  fill?: string;
  stroke?: string;
  height?: number;
  title?: string;
}

export function AreaChartComponent({ 
  data, 
  dataKey, 
  xAxisKey, 
  fill = "#3b82f6", 
  stroke = "#2563eb",
  height = 300,
  title
}: AreaChartComponentProps) {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fill} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={fill} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (typeof value === 'string' && value.includes('-')) {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
              return value;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelFormatter={(value) => {
              if (typeof value === 'string' && value.includes('-')) {
                return new Date(value).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              }
              return value;
            }}
            formatter={(value: any) => {
              if (dataKey.toLowerCase().includes('revenue') || dataKey.toLowerCase().includes('amount')) {
                return `$${Number(value).toFixed(2)}`;
              }
              return value;
            }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={stroke} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

