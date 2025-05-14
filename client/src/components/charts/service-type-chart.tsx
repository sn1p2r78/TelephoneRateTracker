import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Chart from 'chart.js/auto';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

interface ServiceTypeChartProps {
  isLoading?: boolean;
}

export default function ServiceTypeChart({ isLoading = false }: ServiceTypeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Use standard colors instead of CSS variables for chart compatibility
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const data = {
    labels: ['Voice', 'SMS', 'Combined'],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: [
          isDarkMode ? 'rgba(14, 165, 233, 0.8)' : 'rgba(2, 132, 199, 0.8)',     // Primary (sky)
          isDarkMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(220, 38, 38, 0.7)',      // Destructive (red)
          isDarkMode ? 'rgba(161, 161, 170, 0.7)' : 'rgba(113, 113, 122, 0.7)',  // Secondary (zinc)
        ],
        borderColor: [
          isDarkMode ? '#0ea5e9' : '#0284c7',  // Primary (sky)
          isDarkMode ? '#ef4444' : '#dc2626',  // Destructive (red)
          isDarkMode ? '#a1a1aa' : '#71717a',  // Secondary (zinc)
        ],
        borderWidth: 1,
        hoverOffset: 5,
        borderRadius: 3,
      },
    ],
  };

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
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 12,
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i] as number;
                    const backgroundColor = dataset.backgroundColor as string[];
                    return {
                      text: `${label}: ${value}%`,
                      fillStyle: backgroundColor[i],
                      strokeStyle: backgroundColor[i],
                      lineWidth: 0,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value}%`;
              }
            }
          }
        },
        layout: {
          padding: 15
        }
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
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Service Type Distribution</h3>
            <span className="inline-flex items-center justify-center h-5 py-1 px-2 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </span>
          </div>
          
          <div className="flex gap-2">
            <div className="text-xs font-medium">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-primary mr-1"></span>
                <span className="text-xs text-muted-foreground">Voice</span>
              </div>
            </div>
            <div className="text-xs font-medium">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-destructive mr-1"></span>
                <span className="text-xs text-muted-foreground">SMS</span>
              </div>
            </div>
            <div className="text-xs font-medium">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-secondary mr-1"></span>
                <span className="text-xs text-muted-foreground">Combined</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[280px] w-full" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <canvas ref={chartRef} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-xs text-muted-foreground">Total Usage</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-sm font-medium">Voice</div>
            <div className="text-lg font-bold text-primary">45%</div>
            <div className="text-xs text-muted-foreground">↑ 5.2%</div>
          </div>
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-sm font-medium">SMS</div>
            <div className="text-lg font-bold text-destructive">35%</div>
            <div className="text-xs text-muted-foreground">↑ 2.8%</div>
          </div>
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-sm font-medium">Combined</div>
            <div className="text-lg font-bold text-secondary">20%</div>
            <div className="text-xs text-muted-foreground">↓ 1.5%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}