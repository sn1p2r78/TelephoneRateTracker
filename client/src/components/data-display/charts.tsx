import React from 'react';
import {
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartLineChart,
  Line,
  AreaChart as RechartAreaChart,
  Area,
  PieChart as RechartPieChart,
  Pie,
  Cell,
} from 'recharts';

interface Series {
  name: string;
  field: string;
}

interface ChartProps {
  data: any[];
  xField: string;
  series: Series[];
  colors?: string[];
  height?: number;
}

export function BarChart({ data, xField, series, colors = ['#2563eb', '#10b981'], height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '0.375rem',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }} 
        />
        <Legend />
        {series.map((s, index) => (
          <Bar 
            key={s.name} 
            dataKey={s.field} 
            name={s.name} 
            fill={colors[index % colors.length]} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({ data, xField, series, colors = ['#2563eb', '#10b981'], height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '0.375rem',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }} 
        />
        <Legend />
        {series.map((s, index) => (
          <Line 
            key={s.name} 
            type="monotone" 
            dataKey={s.field} 
            name={s.name} 
            stroke={colors[index % colors.length]} 
            activeDot={{ r: 6 }} 
          />
        ))}
      </RechartLineChart>
    </ResponsiveContainer>
  );
}

export function AreaChart({ data, xField, series, colors = ['#2563eb', '#10b981'], height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '0.375rem',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        />
        <Legend />
        {series.map((s, index) => (
          <Area 
            key={s.name} 
            type="monotone" 
            dataKey={s.field} 
            name={s.name} 
            fill={colors[index % colors.length]}
            stroke={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </RechartAreaChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  height?: number;
  showLabels?: boolean;
}

export function DonutChart({ data, colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'], height = 300, showLabels = false }: DonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">No data available</div>;
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {showLabels ? `${name} (${(percent * 100).toFixed(0)}%)` : `${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '0.375rem',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }} 
          formatter={(value: any) => [`${value}`, '']}
        />
      </RechartPieChart>
    </ResponsiveContainer>
  );
}