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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderPlus,
  GlobeIcon,
  Hash,
  Phone,
  PhoneCall,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function NumberRequestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's number requests
  const { data: numberRequests, isLoading } = useQuery({
    queryKey: ["/api/numbers/my-requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/numbers/my-requests");
      return await response.json();
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      case "fulfilled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Fulfilled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Number Requests" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">My Number Requests</h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage your premium rate number requests
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button asChild>
                  <a href="/number-request">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Request
                  </a>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Requests</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <TabsContent value="all">
                <Card>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="py-12 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : !numberRequests || numberRequests.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Phone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No number requests yet</h3>
                        <p className="text-muted-foreground mb-6">
                          You haven't requested any premium rate numbers yet.
                        </p>
                        <Button asChild>
                          <a href="/number-request">Request Numbers</a>
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Requested</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {numberRequests.map((request: any) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">#{request.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {request.country}
                                </div>
                              </TableCell>
                              <TableCell>{request.serviceType}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                {request.createdAt && (
                                  <div className="flex flex-col">
                                    <span className="text-xs">
                                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`/number-requests/${request.id}`}>
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Service Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'pending').map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">#{request.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.country}
                              </div>
                            </TableCell>
                            <TableCell>{request.serviceType}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {request.createdAt && (
                                <div className="flex flex-col">
                                  <span className="text-xs">
                                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/number-requests/${request.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'pending').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center">
                                <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No pending requests found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approved">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Service Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'approved').map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">#{request.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.country}
                              </div>
                            </TableCell>
                            <TableCell>{request.serviceType}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {request.createdAt && (
                                <div className="flex flex-col">
                                  <span className="text-xs">
                                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/number-requests/${request.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'approved').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No approved requests found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fulfilled">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Service Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'fulfilled').map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">#{request.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.country}
                              </div>
                            </TableCell>
                            <TableCell>{request.serviceType}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {request.createdAt && (
                                <div className="flex flex-col">
                                  <span className="text-xs">
                                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/number-requests/${request.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!isLoading && numberRequests?.filter((r: any) => r.status === 'fulfilled').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center">
                                <Hash className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No fulfilled requests found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Information Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Number requests are typically processed within 1-3 business days. You'll receive a notification once your request has been reviewed.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" />
                    Request Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Each account may have up to 10 active requests at a time. You can request up to 100 numbers per request, subject to availability.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <PhoneCall className="h-5 w-5 mr-2 text-muted-foreground" />
                    Activation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Once your request is fulfilled, the numbers will be activated and added to your account. You can then use them for your services.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}