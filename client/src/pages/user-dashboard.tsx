import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import HeaderNav from "@/components/header-nav";
import SidebarNav from "@/components/sidebar-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
} from "@/components/data-display/charts";
import {
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  DollarSign,
  Download,
  ExternalLink,
  LineChart as LineChartIcon,
  MessageSquare,
  PhoneCall,
  PieChart,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Smartphone
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function UserDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/user/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/dashboard");
      return await response.json();
    },
  });
  
  // Fetch user's recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/user/activity"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/activity");
      return await response.json();
    },
  });
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  const formatActivityTime = (date: string | Date | null) => {
    if (!date) return 'Unknown';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  const getActivityIcon = (type: string) => {
    if (type === 'call') {
      return <PhoneCall className="h-4 w-4 text-blue-500" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Dashboard" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overview of your premium rate numbers and activity
              </p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Numbers</p>
                    <p className="text-2xl font-bold">
                      {dashboardLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        dashboardData?.activeNumbers || 0
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-2xl font-bold">
                      {dashboardLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        dashboardData?.totalCalls || 0
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total SMS</p>
                    <p className="text-2xl font-bold">
                      {dashboardLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        dashboardData?.totalSMS || 0
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {dashboardLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        formatCurrency(dashboardData?.totalRevenue || 0)
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Revenue and Analytics */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Monthly revenue from calls and SMS
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <CalendarRange className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted/10 rounded-lg">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : dashboardData?.revenueHistory ? (
                    <BarChart
                      data={dashboardData.revenueHistory}
                      xField="date"
                      series={[
                        { name: "Voice", field: "voice" },
                        { name: "SMS", field: "sms" },
                      ]}
                      colors={["#2563eb", "#10b981"]}
                      height={300}
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted/10 rounded-lg">
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>
                    Revenue distribution by service type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="w-full aspect-[1/1] flex items-center justify-center bg-muted/10 rounded-lg">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <DonutChart
                        data={[
                          { name: "Voice", value: dashboardData?.callRevenue || 0 },
                          { name: "SMS", value: dashboardData?.smsRevenue || 0 },
                        ]}
                        colors={["#2563eb", "#10b981"]}
                        height={220}
                        showLabels={true}
                      />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm font-medium">Voice</span>
                          </div>
                          <p className="font-bold">{formatCurrency(dashboardData?.callRevenue || 0)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-medium">SMS</span>
                          </div>
                          <p className="font-bold">{formatCurrency(dashboardData?.smsRevenue || 0)}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest calls and messages
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : !activityData || activityData.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Once you start receiving calls and messages to your premium numbers, they'll appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityData.map((activity: any) => (
                        <div key={`${activity.activityType}-${activity.id}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className={`p-2 rounded-full ${activity.activityType === 'call' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {getActivityIcon(activity.activityType)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {activity.activityType === 'call' ? 'Call' : 'SMS'} from {activity.caller || activity.sender || 'Unknown'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.activityType === 'call' ? 
                                    `Duration: ${activity.duration || 0}s` : 
                                    `Message: ${activity.message?.substring(0, 40)}${activity.message?.length > 40 ? '...' : ''}`
                                  }
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatActivityTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-4">
                        <Button variant="link" asChild>
                          <a href="/cdir">
                            View All Activity
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" asChild>
                    <a href="/number-request">
                      <Plus className="mr-2 h-4 w-4" />
                      Request New Numbers
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/number-requests">
                      <Smartphone className="mr-2 h-4 w-4" />
                      View My Numbers
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/payment-profile">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Payment Settings
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/auto-responders">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      SMS Auto-Responders
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/api-integrations">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      API Integrations
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}