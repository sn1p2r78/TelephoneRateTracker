import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { formatDateForDisplay } from '@/lib/utils';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout';

// Sample country list - would be fetched from API in a real application
const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'it', label: 'Italy' },
  { value: 'es', label: 'Spain' },
  { value: 'ru', label: 'Russia' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
];

// Sample service types
const serviceOptions = [
  { value: 'support', label: 'Support' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'adult', label: 'Adult Services' },
  { value: 'psychic', label: 'Psychic Services' },
  { value: 'information', label: 'Information Services' },
];

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    case 'fulfilled':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Fulfilled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function NumberRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-requests');
  
  // Form state
  const [formData, setFormData] = useState({
    country: '',
    serviceType: '',
    quantity: 1,
    notes: ''
  });
  
  // Get user's number requests
  const { 
    data: numberRequests = [], 
    isLoading,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ['/api/numbers/my-requests'],
    enabled: !!user,
  });
  
  // Mutation for creating new number request
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/numbers/request', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request Submitted',
        description: 'Your number request has been submitted successfully.',
      });
      setFormData({
        country: '',
        serviceType: '',
        quantity: 1,
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/numbers/my-requests'] });
      setActiveTab('my-requests');
    },
    onError: (error: any) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to submit your number request.',
        variant: 'destructive',
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.country || !formData.serviceType || formData.quantity < 1) {
      toast({
        title: 'Invalid Request',
        description: 'Please complete all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    createRequestMutation.mutate({
      ...formData,
      userId: user?.id
    });
  };
  
  // Filter requests by status
  const pendingRequests = Array.isArray(numberRequests) 
    ? numberRequests.filter((request: any) => request.status.toLowerCase() === 'pending')
    : [];
  
  const approvedRequests = Array.isArray(numberRequests)
    ? numberRequests.filter((request: any) => 
        request.status.toLowerCase() === 'approved' || 
        request.status.toLowerCase() === 'fulfilled')
    : [];
  
  return (
    <Layout title="Number Requests">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Number Requests</h1>
          <p className="text-muted-foreground">
            Request new premium rate numbers for your account
          </p>
        </div>
        
        <Tabs defaultValue="my-requests" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-requests" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Request History</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => refetchRequests()} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !Array.isArray(numberRequests) || numberRequests.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="mb-2 text-muted-foreground">You haven't made any number requests yet.</p>
                    <Button onClick={() => setActiveTab('new-request')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Pending Requests</CardTitle>
                      <CardDescription>
                        These requests are waiting for approval
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Date Requested</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingRequests.map((request: any) => (
                            <TableRow key={request.id}>
                              <TableCell>{countryOptions.find(c => c.value === request.country)?.label || request.country}</TableCell>
                              <TableCell>{serviceOptions.find(s => s.value === request.serviceType)?.label || request.serviceType}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{formatDateForDisplay(request.createdAt)}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                
                {approvedRequests.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Approved Requests</CardTitle>
                      <CardDescription>
                        These numbers have been assigned to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Date Assigned</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedRequests.map((request: any) => (
                            <TableRow key={request.id}>
                              <TableCell>{countryOptions.find(c => c.value === request.country)?.label || request.country}</TableCell>
                              <TableCell>{serviceOptions.find(s => s.value === request.serviceType)?.label || request.serviceType}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{formatDateForDisplay(request.updatedAt || request.createdAt)}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Assigned Numbers
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle>Request New Numbers</CardTitle>
                <CardDescription>
                  Fill out the form below to request premium rate numbers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => handleSelectChange('country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.serviceType} 
                        onValueChange={(value) => handleSelectChange('serviceType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">Maximum 10 numbers per request</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Any specific requirements or preferences"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-start">
                    <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 flex space-x-3">
                      <div className="mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Important Information</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Number requests are subject to approval and availability</li>
                          <li>Processing may take 24-48 hours</li>
                          <li>Rates and charges will be displayed after approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('my-requests')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}