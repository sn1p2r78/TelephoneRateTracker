import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowUpRight, DollarSign } from 'lucide-react';
import Chart from 'chart.js/auto';

interface RevenueChartProps {
  isLoading?: boolean;
}

export default function RevenueChart({ isLoading = false }: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);

  const dayData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [850, 1200, 2450, 1920, 2580, 2310],
    previousValues: [750, 1100, 2200, 1800, 2400, 2200],
  };

  const weekData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [1850, 2120, 1920, 2450, 2100, 2580, 2310],
    previousValues: [1700, 2000, 1800, 2300, 2000, 2400, 2200],
  };

  const monthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [8550, 9200, 10450, 12100],
    previousValues: [8000, 8800, 9900, 11500],
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

    const data = getDataForRange();
    
    // Calculate total revenue and percentage change
    const currentTotal = data.values.reduce((a, b) => a + b, 0);
    const previousTotal = data.previousValues.reduce((a, b) => a + b, 0);
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    setTotalRevenue(currentTotal);
    setPercentChange(change);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'hsla(var(--primary), 0.2)');
    gradient.addColorStop(1, 'hsla(var(--primary), 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Revenue',
            data: data.values,
            borderColor: 'hsl(var(--primary))',
            backgroundColor: gradient,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: 'hsl(var(--primary))',
            pointBorderColor: 'hsl(var(--background))',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Previous Period',
            data: data.previousValues,
            borderColor: 'hsla(var(--muted-foreground), 0.5)',
            borderDash: [5, 5],
            tension: 0.3,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw as number;
                return `${label}: $${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(var(--muted), 0.1)',
              // Modern Chart.js doesn't use drawBorder anymore
              display: true,
            },
            ticks: {
              callback: (value) => `$${value}`,
              font: {
                size: 11,
              },
              color: 'hsl(var(--muted-foreground))',
            },
            border: {
              dash: [5, 5],
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
              color: 'hsl(var(--muted-foreground))',
            },
            border: {
              dash: [5, 5],
            }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Revenue Trend</h3>
          </div>
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
        
        {!isLoading && (
          <div className="flex items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total for selected period
              </div>
            </div>
            
            {percentChange > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">{percentChange.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
        
        <div className="relative h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[280px] w-full" />
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
        
        {!isLoading && (
          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground">Avg. Per Day</div>
              <div className="text-sm font-medium mt-1">
                {formatCurrency(totalRevenue / getDataForRange().labels.length)}
              </div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground">Peak Period</div>
              <div className="text-sm font-medium mt-1">
                {timeRange === 'day' ? '16:00 - 20:00' : 
                 timeRange === 'week' ? 'Sat - Sun' : 'Week 4'}
              </div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground">Projected</div>
              <div className="text-sm font-medium mt-1">
                +{(percentChange * 1.2).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}