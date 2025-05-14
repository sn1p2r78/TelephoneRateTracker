import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw, Download, BarChart2, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

interface RevenueData {
  totalRevenue: number;
  callRevenue: number;
  smsRevenue: number;
  revenueByType: {
    voice: number;
    sms: number;
    combined: number;
  };
  revenueByCountry: {
    country: string;
    revenue: number;
  }[];
  revenueOverTime: {
    period: string;
    voice: number;
    sms: number;
    combined: number;
  }[];
  servicePerformance: {
    name: string;
    type: string;
    revenue: number;
  }[];
}

export default function RevenueReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [graphType, setGraphType] = useState('bar');
  
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const revenueByTypeChartRef = useRef<HTMLCanvasElement>(null);
  const revenueByCountryChartRef = useRef<HTMLCanvasElement>(null);
  const revenueOverTimeChartRef = useRef<HTMLCanvasElement>(null);
  
  const revenueChartInstance = useRef<Chart | null>(null);
  const revenueByTypeChartInstance = useRef<Chart | null>(null);
  const revenueByCountryChartInstance = useRef<Chart | null>(null);
  const revenueOverTimeChartInstance = useRef<Chart | null>(null);

  const { data, isLoading, refetch } = useQuery<RevenueData>({
    queryKey: ['/api/dashboard', dateRange],
    refetchOnWindowFocus: false,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sample data for when we don't have real data yet
  const sampleData = {
    totalRevenue: 14328.65,
    callRevenue: 8762.45,
    smsRevenue: 5566.20,
    revenueByType: {
      voice: 65,
      sms: 28,
      combined: 7
    },
    revenueByCountry: [
      { country: 'United Kingdom', revenue: 5428.65 },
      { country: 'United States', revenue: 3932.10 },
      { country: 'Germany', revenue: 2453.25 },
      { country: 'Australia', revenue: 1625.80 },
      { country: 'France', revenue: 888.85 }
    ],
    revenueOverTime: [
      { period: 'Week 1', voice: 1850, sms: 842, combined: 124 },
      { period: 'Week 2', voice: 2120, sms: 952, combined: 136 },
      { period: 'Week 3', voice: 1920, sms: 876, combined: 148 },
      { period: 'Week 4', voice: 2450, sms: 1125, combined: 175 },
    ],
    servicePerformance: [
      { name: 'Support Hotline', type: 'voice', revenue: 6421.75 },
      { name: 'Quiz Voting', type: 'sms', revenue: 3845.50 },
      { name: 'Entertainment Hotline', type: 'voice', revenue: 2356.80 },
      { name: 'Horoscope Updates', type: 'sms', revenue: 856.35 },
      { name: 'Psychic Service', type: 'voice', revenue: 848.25 }
    ]
  };

  const displayData = data || sampleData;

  // Initialize charts
  useEffect(() => {
    if (isLoading) return;
    
    // Revenue by Type Chart
    if (revenueByTypeChartRef.current) {
      const ctx = revenueByTypeChartRef.current.getContext('2d');
      if (ctx) {
        if (revenueByTypeChartInstance.current) {
          revenueByTypeChartInstance.current.destroy();
        }
        
        revenueByTypeChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Voice', 'SMS', 'Combined'],
            datasets: [{
              data: [
                displayData.revenueByType.voice,
                displayData.revenueByType.sms,
                displayData.revenueByType.combined
              ],
              backgroundColor: [
                'hsl(var(--primary))',
                'hsl(var(--accent))',
                'hsl(var(--success))'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            cutout: '70%'
          }
        });
      }
    }
    
    // Revenue by Country Chart
    if (revenueByCountryChartRef.current) {
      const ctx = revenueByCountryChartRef.current.getContext('2d');
      if (ctx) {
        if (revenueByCountryChartInstance.current) {
          revenueByCountryChartInstance.current.destroy();
        }
        
        revenueByCountryChartInstance.current = new Chart(ctx, {
          type: graphType === 'bar' ? 'bar' : 'pie',
          data: {
            labels: displayData.revenueByCountry.map(c => c.country),
            datasets: [{
              label: 'Revenue',
              data: displayData.revenueByCountry.map(c => c.revenue),
              backgroundColor: [
                'hsl(var(--primary))',
                'hsl(var(--secondary))',
                'hsl(var(--accent))',
                'hsl(var(--success))',
                'hsl(var(--destructive))'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: graphType === 'pie',
                position: 'bottom'
              }
            },
            scales: graphType === 'bar' ? {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: (value) => `$${value}`
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            } : undefined
          }
        });
      }
    }
    
    // Revenue Over Time Chart
    if (revenueOverTimeChartRef.current) {
      const ctx = revenueOverTimeChartRef.current.getContext('2d');
      if (ctx) {
        if (revenueOverTimeChartInstance.current) {
          revenueOverTimeChartInstance.current.destroy();
        }
        
        revenueOverTimeChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: displayData.revenueOverTime.map(d => d.period),
            datasets: [
              {
                label: 'Voice',
                data: displayData.revenueOverTime.map(d => d.voice),
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.1)',
                tension: 0.3,
                fill: false
              },
              {
                label: 'SMS',
                data: displayData.revenueOverTime.map(d => d.sms),
                borderColor: 'hsl(var(--accent))',
                backgroundColor: 'hsla(var(--accent), 0.1)',
                tension: 0.3,
                fill: false
              },
              {
                label: 'Combined',
                data: displayData.revenueOverTime.map(d => d.combined),
                borderColor: 'hsl(var(--success))',
                backgroundColor: 'hsla(var(--success), 0.1)',
                tension: 0.3,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: (value) => `$${value}`
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (revenueByTypeChartInstance.current) {
        revenueByTypeChartInstance.current.destroy();
      }
      if (revenueByCountryChartInstance.current) {
        revenueByCountryChartInstance.current.destroy();
      }
      if (revenueOverTimeChartInstance.current) {
        revenueOverTimeChartInstance.current.destroy();
      }
    };
  }, [isLoading, displayData, graphType]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative md:flex transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Revenue Reports" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Revenue Reports</h1>
            <p className="text-muted-foreground">View and analyze revenue from premium rate numbers</p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-4 justify-between">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <Label className="text-sm">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="min-w-[180px]">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Revenue Overview</SelectItem>
                        <SelectItem value="byCountry">Revenue by Country</SelectItem>
                        <SelectItem value="byService">Revenue by Service</SelectItem>
                        <SelectItem value="trend">Revenue Trends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Date Range</Label>
                    <div className="flex">
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="rounded-r-none min-w-[140px]">
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="90">Last 3 months</SelectItem>
                          <SelectItem value="365">Last year</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="default" className="rounded-l-none">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Graph Type</Label>
                    <Select value={graphType} onValueChange={setGraphType}>
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="Select graph type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button 
                    onClick={() => refetch()} 
                    className="flex items-center"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Overview */}
          <div className="grid gap-6 mb-6">
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-36" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">${displayData.totalRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        ${displayData.callRevenue.toFixed(2)} from calls + ${displayData.smsRevenue.toFixed(2)} from SMS
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Revenue by Type</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Skeleton className="h-[150px] w-[150px] rounded-full" />
                      </div>
                    ) : (
                      <canvas ref={revenueByTypeChartRef}></canvas>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Top Performing Service</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-36" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{displayData.servicePerformance[0]?.name || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">
                        ${displayData.servicePerformance[0]?.revenue.toFixed(2) || '0.00'} in revenue
                      </p>
                      <div className="mt-4">
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${(displayData.servicePerformance[0]?.revenue / displayData.totalRevenue * 100) || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {((displayData.servicePerformance[0]?.revenue / displayData.totalRevenue * 100) || 0).toFixed(1)}% of total revenue
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Country Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>Revenue by Country</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={graphType === 'bar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setGraphType('bar')}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={graphType === 'pie' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setGraphType('pie')}
                  >
                    <PieChart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[350px] w-full" />
                    </div>
                  ) : (
                    <canvas ref={revenueByCountryChartRef}></canvas>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Over Time Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>Revenue Trend Over Time</CardTitle>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[350px] w-full" />
                    </div>
                  ) : (
                    <canvas ref={revenueOverTimeChartRef}></canvas>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Services Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>Service Revenue Breakdown</CardTitle>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-3 px-4"><Skeleton className="h-5 w-32" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                          </tr>
                        ))
                      ) : (
                        displayData.servicePerformance.map((service, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium">{service.name}</td>
                            <td className="py-3 px-4 text-sm capitalize">{service.type}</td>
                            <td className="py-3 px-4 text-sm font-medium">${service.revenue.toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm">
                              {((service.revenue / displayData.totalRevenue) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
