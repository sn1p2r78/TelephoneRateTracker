import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreVertical, RefreshCw, Search, Download, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SMSLog } from '@shared/schema';

export default function SMSLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [country, setCountry] = useState('all');
  const [service, setService] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<SMSLog | null>(null);

  const { data, isLoading, refetch } = useQuery<SMSLog[]>({
    queryKey: ['/api/sms-logs', dateRange, country, service],
    refetchOnWindowFocus: false,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredLogs = data?.filter(log => 
    log.senderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <HeaderNav title="SMS Logs" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">SMS Logs</h1>
            <p className="text-muted-foreground">View and manage all premium rate SMS records</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search SMS logs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Country</Label>
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

                <div>
                  <Label className="text-sm">Service Type</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="Quiz Vote">Quiz Vote</SelectItem>
                      <SelectItem value="Voting Service">Voting Service</SelectItem>
                      <SelectItem value="Horoscope Updates">Horoscope Updates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <p className="text-sm text-muted-foreground pt-2">
                  {filteredLogs ? `Showing ${filteredLogs.length} of ${data?.length} logs` : ""}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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

          {/* SMS Logs Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Number</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Sender</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Country</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Service</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Length</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Preview</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3 px-5"><Skeleton className="h-5 w-32" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-28" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-20" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-28" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-12" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-32" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-24" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-12" /></td>
                      </tr>
                    ))
                  ) : filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm">{log.numberId}</td>
                        <td className="py-3 px-5 text-sm">{log.senderNumber || "Unknown"}</td>
                        <td className="py-3 px-5 text-sm">{log.countryCode}</td>
                        <td className="py-3 px-5 text-sm">{log.serviceType}</td>
                        <td className="py-3 px-5 text-sm">{log.messageLength} chars</td>
                        <td className="py-3 px-5 text-sm truncate max-w-[200px]">
                          {log.message ? log.message.substring(0, 25) + (log.message.length > 25 ? '...' : '') : 'No message'}
                        </td>
                        <td className="py-3 px-5 text-sm font-medium">${log.revenue.toFixed(2)}</td>
                        <td className="py-3 px-5 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-5 text-sm">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-primary h-8 w-8"
                                onClick={() => setSelectedMessage(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>SMS Message Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">From</p>
                                    <p className="font-medium">{log.senderNumber || "Unknown"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Service</p>
                                    <p className="font-medium">{log.serviceType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                                    <p className="font-medium">${log.revenue.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Message Content</p>
                                  <div className="bg-muted p-4 rounded-md">
                                    <p>{log.message || "No message content"}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Length</p>
                                    <p className="font-medium">{log.messageLength} characters</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                                    <p className="font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No SMS logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredLogs ? `Showing ${Math.min(filteredLogs.length, 10)} of ${filteredLogs.length} records` : "No records"}
              </span>
              <div className="flex space-x-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button variant="default" size="sm" className="h-8 w-8">1</Button>
                <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
                <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
                <Button variant="outline" size="sm" className="h-8 w-8">...</Button>
                <Button variant="outline" size="sm" className="h-8 w-8">10</Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
