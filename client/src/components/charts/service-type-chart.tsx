import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Chart from 'chart.js/auto';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceTypeChartProps {
  isLoading?: boolean;
}

export default function ServiceTypeChart({ isLoading = false }: ServiceTypeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Voice', 'SMS', 'Combined'],
        datasets: [
          {
            data: [65, 28, 7],
            backgroundColor: [
              'hsl(var(--primary))',
              'hsl(var(--accent))',
              'hsl(var(--success))',
            ],
            borderWidth: 0,
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
        cutout: '70%',
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isLoading]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Revenue by Service Type</h3>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[280px] w-full rounded-full" />
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center">
            <div className="inline-block w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm ml-1">Voice</span>
          </div>
          <div className="text-center">
            <div className="inline-block w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm ml-1">SMS</span>
          </div>
          <div className="text-center">
            <div className="inline-block w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm ml-1">Combined</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
