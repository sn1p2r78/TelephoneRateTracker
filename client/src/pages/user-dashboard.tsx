import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataTable } from '@/components/ui/data-table';
import { RolePanel } from '@/components/role-panel';
import { Loader2, Activity, DollarSign, PhoneCall, MessageCircle, User, Users, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Dashboard stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon, trend, loading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// Sample data for charts
const revenueData = [
  { name: 'Jan', revenue: 3000 },
  { name: 'Feb', revenue: 3500 },
  { name: 'Mar', revenue: 2800 },
  { name: 'Apr', revenue: 4200 },
  { name: 'May', revenue: 3800 },
  { name: 'Jun', revenue: 4300 },
  { name: 'Jul', revenue: 5000 },
];

const messagesData = [
  { name: 'Mon', sms: 120, calls: 45 },
  { name: 'Tue', sms: 180, calls: 60 },
  { name: 'Wed', sms: 150, calls: 55 },
  { name: 'Thu', sms: 200, calls: 70 },
  { name: 'Fri', sms: 230, calls: 80 },
  { name: 'Sat', sms: 140, calls: 40 },
  { name: 'Sun', sms: 100, calls: 25 },
];

const countryData = [
  { name: 'USA', value: 35 },
  { name: 'UK', value: 25 },
  { name: 'Germany', value: 15 },
  { name: 'France', value: 10 },
  { name: 'Others', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get dashboard data based on user role
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !!user,
  });

  // Determine which dashboard to show based on user role
  const userRole = user?.role || 'user';
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || user?.username || 'User'}!
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Key metrics - shows for all roles */}
            <StatCard 
              title="Total Revenue" 
              value={isLoading ? '...' : formatCurrency(dashboardData?.totalRevenue || 0)}
              description="Lifetime earnings from premium rate numbers"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 12.5, label: 'from last month' }}
              loading={isLoading}
            />
            
            <StatCard 
              title="Call Minutes" 
              value={isLoading ? '...' : formatNumber(dashboardData?.callMinutes || 0)}
              description="Total call minutes processed"
              icon={<PhoneCall className="h-4 w-4" />}
              trend={{ value: 8.2, label: 'from last month' }}
              loading={isLoading}
            />
            
            <StatCard 
              title="SMS Messages" 
              value={isLoading ? '...' : formatNumber(dashboardData?.smsCount || 0)}
              description="Total SMS messages received"
              icon={<MessageCircle className="h-4 w-4" />}
              trend={{ value: 14.3, label: 'from last month' }}
              loading={isLoading}
            />
            
            <StatCard 
              title="Active Numbers" 
              value={isLoading ? '...' : formatNumber(dashboardData?.activeNumberCount || 0)}
              description="Currently active premium rate numbers"
              icon={<PhoneCall className="h-4 w-4" />}
              loading={isLoading}
            />
          </div>
          
          {/* Charts section - only shows for admin and users with enough data */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue from premium rate numbers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Traffic by Country</CardTitle>
                <CardDescription>Call and SMS distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent activity - not shown for test users */}
          {userRole !== 'test' && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest call and SMS activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={messagesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sms" fill="#8884d8" name="SMS Messages" />
                    <Bar dataKey="calls" fill="#82ca9d" name="Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View All Activity</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed analytics for your premium rate numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced analytics features coming soon. This section will include detailed reports,
                custom date range filters, and performance comparisons.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your profile and account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Username</span>
                    <span className="text-sm text-muted-foreground">{user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Full Name</span>
                    <span className="text-sm text-muted-foreground">{user?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm text-muted-foreground">{user?.email || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Phone</span>
                    <span className="text-sm text-muted-foreground">{user?.phoneNumber || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Account Status</span>
                    <span className="text-sm text-muted-foreground capitalize">{user?.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Current Balance</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(user?.balance || 0)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Edit Profile</Button>
              </CardFooter>
            </Card>
            
            <RolePanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}