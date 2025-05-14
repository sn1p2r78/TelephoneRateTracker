import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import StatCards from '@/components/stats/stat-cards';
import RevenueChart from '@/components/charts/revenue-chart';
import ServiceTypeChart from '@/components/charts/service-type-chart';
import RecentActivityTable from '@/components/tables/recent-activity-table';
import CountryPerformance from '@/components/reports/country-performance';
import ServicePerformance from '@/components/reports/service-performance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('7');
  const [country, setCountry] = useState('all');
  const [serviceType, setServiceType] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/dashboard', dateRange, country, serviceType],
    refetchOnWindowFocus: false,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        <HeaderNav title="Dashboard" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
              <Label className="block text-sm font-medium mb-1">Date Range</Label>
              <div className="flex">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="rounded-r-none">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="default" className="rounded-l-none">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
              <Label className="block text-sm font-medium mb-1">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
              <Label className="block text-sm font-medium mb-1">Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="ml-auto flex-grow md:flex-grow-0 w-full md:w-auto flex items-end">
              <Button 
                onClick={() => refetch()} 
                className="w-full md:w-auto flex items-center"
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatCards 
            stats={data} 
            isLoading={isLoading} 
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart isLoading={isLoading} />
            <ServiceTypeChart isLoading={isLoading} />
          </div>

          {/* Recent Activity Table */}
          <RecentActivityTable 
            activities={data?.recentActivity} 
            isLoading={isLoading} 
          />

          {/* Regional Performance & Service Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CountryPerformance 
              countries={data?.topCountries} 
              isLoading={isLoading} 
            />
            <ServicePerformance 
              services={data?.servicePerformance} 
              isLoading={isLoading} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
