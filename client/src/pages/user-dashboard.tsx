import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import { 
  LayoutDashboard, 
  PhoneCall,
  MessageSquare,
  DollarSign,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone,
  Clock,
  Globe,
  Hash
} from "lucide-react";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Get user dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/user/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/dashboard");
      return await response.json();
    },
  });

  // Get user's number requests
  const { data: numberRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/numbers/my-requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/numbers/my-requests");
      return await response.json();
    },
  });

  // Get recent activity (calls and SMS)
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/user/activity"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/activity");
      return await response.json();
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>;
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case "rejected":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      case "fulfilled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Fulfilled
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="User Dashboard" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {user?.fullName || user?.username}</h1>
                <p className="text-muted-foreground mt-1">
                  Your premium rate number services dashboard
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button asChild>
                  <a href="/number-request">
                    <Phone className="mr-2 h-4 w-4" />
                    Request New Numbers
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Numbers</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {dashboardLoading ? "--" : dashboardData?.activeNumbers || 0}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {dashboardLoading ? "--" : dashboardData?.totalCalls || 0}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <PhoneCall className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total SMS</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {dashboardLoading ? "--" : dashboardData?.totalSMS || 0}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">
                        ${dashboardLoading ? "--" : dashboardData?.totalRevenue.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest calls and SMS messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="calls">Calls</TabsTrigger>
                      <TabsTrigger value="sms">SMS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      {activityLoading ? (
                        <div className="py-6 flex justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : recentActivity?.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">No recent activity found</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {recentActivity?.map((activity: any) => (
                            <div key={`${activity.id}-${activity.activityType}`} className="flex items-start space-x-4">
                              <div className={`p-2 rounded-full ${
                                activity.activityType === 'call' 
                                  ? 'bg-blue-100' 
                                  : 'bg-green-100'
                              }`}>
                                {activity.activityType === 'call' ? (
                                  <PhoneCall className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">
                                  {activity.activityType === 'call' 
                                    ? `Call ${activity.direction === 'INBOUND' ? 'from' : 'to'} ${activity.numberValue}`
                                    : `SMS ${activity.direction === 'INBOUND' ? 'from' : 'to'} ${activity.numberValue}`
                                  }
                                </p>
                                {activity.activityType === 'call' && (
                                  <p className="text-sm text-muted-foreground">
                                    Duration: {activity.duration} seconds
                                  </p>
                                )}
                                {activity.activityType === 'sms' && activity.message && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {activity.message}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Unknown time'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  ${activity.revenue?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="calls">
                      {activityLoading ? (
                        <div className="py-6 flex justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : recentActivity?.filter((a: any) => a.activityType === 'call').length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">No recent calls found</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {recentActivity?.filter((a: any) => a.activityType === 'call').map((activity: any) => (
                            <div key={activity.id} className="flex items-start space-x-4">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <PhoneCall className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">
                                  Call {activity.direction === 'INBOUND' ? 'from' : 'to'} {activity.numberValue}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Duration: {activity.duration} seconds
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Unknown time'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  ${activity.revenue?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="sms">
                      {activityLoading ? (
                        <div className="py-6 flex justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : recentActivity?.filter((a: any) => a.activityType === 'sms').length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">No recent SMS messages found</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {recentActivity?.filter((a: any) => a.activityType === 'sms').map((activity: any) => (
                            <div key={activity.id} className="flex items-start space-x-4">
                              <div className="p-2 bg-green-100 rounded-full">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">
                                  SMS {activity.direction === 'INBOUND' ? 'from' : 'to'} {activity.numberValue}
                                </p>
                                {activity.message && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {activity.message}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Unknown time'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  ${activity.revenue?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="justify-between border-t pt-5 pb-2">
                  <p className="text-sm text-muted-foreground">
                    Showing recent activity from the last 30 days
                  </p>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/cdir">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Number Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Number Requests</CardTitle>
                  <CardDescription>
                    Your premium number requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="py-6 flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : numberRequests?.length === 0 ? (
                    <div className="py-10 text-center">
                      <Phone className="mx-auto h-10 w-10 text-muted-foreground opacity-40 mb-3" />
                      <p className="text-muted-foreground mb-4">No number requests yet</p>
                      <Button asChild>
                        <a href="/number-request">Request Numbers</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {numberRequests?.slice(0, 5).map((request: any) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.country}</span>
                            </div>
                            {getRequestStatusBadge(request.status)}
                          </div>
                          <p className="text-sm mb-2">
                            <span className="font-medium">Service:</span> {request.serviceType}
                          </p>
                          <p className="text-sm mb-2">
                            <span className="font-medium">Quantity:</span> {request.quantity}
                          </p>
                          {request.notes && (
                            <p className="text-sm mb-2 line-clamp-2">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Requested {request.createdAt ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }) : 'Unknown time'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end border-t pt-5 pb-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/number-requests">
                      View All Requests
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Revenue Chart */}
            {!dashboardLoading && dashboardData?.revenueHistory && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Revenue History</CardTitle>
                  <CardDescription>
                    Your earnings over time from premium rate services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dashboardData.revenueHistory}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="voice" name="Voice" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="sms" name="SMS" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}