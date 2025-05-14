import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Chart from 'chart.js/auto';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueChartProps {
  isLoading?: boolean;
}

export default function RevenueChart({ isLoading = false }: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const dayData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [850, 1200, 2450, 1920, 2580, 2310],
  };

  const weekData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [1850, 2120, 1920, 2450, 2100, 2580, 2310],
  };

  const monthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [8550, 9200, 10450, 12100],
  };

  const getDataForRange = () => {
    switch (timeRange) {
      case 'day':
        return dayData;
      case 'week':
        return weekData;
      case 'month':
        return monthData;
    }
  };

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const data = getDataForRange();

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Revenue',
            data: data.values,
            borderColor: 'hsl(var(--primary))',
            backgroundColor: 'hsla(var(--primary), 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: (value) => `$${value}`,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [timeRange, isLoading]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Revenue Trend</h3>
          <Tabs
            defaultValue="day"
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'day' | 'week' | 'month')}
          >
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="day" className="text-xs px-2 py-1">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2 py-1">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2 py-1">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="relative h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[280px] w-full" />
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
