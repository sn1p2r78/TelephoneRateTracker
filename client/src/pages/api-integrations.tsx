import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Plus, 
  AlertCircle, 
  Check, 
  Cable, 
  Clock,
  Trash2,
  Edit,
  Link2,
  Key,
  Globe
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ApiIntegration, insertApiIntegrationSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from '@/components/ui/textarea';

// Extend the insertApiIntegrationSchema for form validation
const apiFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  provider: z.string().min(2, "Provider is required"),
  apiKey: z.string().optional(),
  endpoint: z.string().url("Must be a valid URL"),
  isActive: z.boolean().default(true),
  configuration: z.any().optional(), // For JSON configuration
});

type ApiFormValues = z.infer<typeof apiFormSchema>;

export default function ApiIntegrations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<ApiIntegration | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<ApiIntegration | null>(null);
  const [isTestingDialogOpen, setIsTestingDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { toast } = useToast();

  const { data: integrations, isLoading, refetch } = useQuery<ApiIntegration[]>({
    queryKey: ['/api/integrations'],
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ApiFormValues) => {
      const res = await apiRequest("POST", "/api/integrations", {
        ...data,
        configuration: typeof data.configuration === 'string' 
          ? JSON.parse(data.configuration) 
          : data.configuration
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API integration created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsFormOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ApiFormValues }) => {
      const res = await apiRequest("PUT", `/api/integrations/${id}`, {
        ...data,
        configuration: typeof data.configuration === 'string' 
          ? JSON.parse(data.configuration) 
          : data.configuration
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API integration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsFormOpen(false);
      setEditingIntegration(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/integrations/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API integration deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/integrations/${id}/status`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API integration status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/integrations/${id}/test`, {});
      return await res.json();
    },
    onSuccess: () => {
      setTestResult({ 
        success: true, 
        message: "Connection to API was successful!" 
      });
    },
    onError: (error: Error) => {
      setTestResult({ 
        success: false, 
        message: `Connection failed: ${error.message}` 
      });
    },
  });

  const form = useForm<ApiFormValues>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      name: "",
      provider: "",
      apiKey: "",
      endpoint: "",
      isActive: true,
      configuration: {},
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddNewClick = () => {
    setEditingIntegration(null);
    form.reset({
      name: "",
      provider: "",
      apiKey: "",
      endpoint: "",
      isActive: true,
      configuration: {},
    });
    setIsFormOpen(true);
  };

  const handleEditIntegration = (integration: ApiIntegration) => {
    setEditingIntegration(integration);
    form.reset({
      name: integration.name,
      provider: integration.provider,
      apiKey: integration.apiKey || "",
      endpoint: integration.endpoint || "",
      isActive: integration.isActive,
      configuration: integration.configuration 
        ? JSON.stringify(integration.configuration, null, 2) 
        : "{}",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (integration: ApiIntegration) => {
    setIntegrationToDelete(integration);
    setIsDeleteDialogOpen(true);
  };

  const handleTestIntegration = (integration: ApiIntegration) => {
    setTestingIntegration(integration);
    setTestResult(null);
    setIsTestingDialogOpen(true);
    // Simulate testing the API
    setTimeout(() => {
      if (integration.isActive && integration.endpoint) {
        testIntegrationMutation.mutate(integration.id);
      } else {
        setTestResult({
          success: false,
          message: "Integration is either inactive or missing endpoint information."
        });
      }
    }, 1500);
  };

  const onSubmit = (data: ApiFormValues) => {
    // Handle JSON configuration
    try {
      if (typeof data.configuration === 'string') {
        JSON.parse(data.configuration);
      }
      
      if (editingIntegration) {
        updateMutation.mutate({ id: editingIntegration.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "The configuration field must contain valid JSON",
        variant: "destructive",
      });
    }
  };

  const getFilteredIntegrations = () => {
    if (!integrations) return [];
    
    if (activeTab === 'all') return integrations;
    return integrations.filter(integration => 
      activeTab === 'active' ? integration.isActive : !integration.isActive
    );
  };

  const filteredIntegrations = getFilteredIntegrations();

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
        <HeaderNav title="API Integrations" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">API Integrations</h1>
              <p className="text-muted-foreground">Manage connections to SMS and voice providers</p>
            </div>
            <Button onClick={handleAddNewClick} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Integration
            </Button>
          </div>

          {/* Integration Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="all">All Integrations</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    onClick={() => refetch()}
                    variant="outline" 
                    className="flex items-center"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {/* Integration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end gap-2">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-20" />
                        </CardFooter>
                      </Card>
                    ))
                  ) : filteredIntegrations.length > 0 ? (
                    filteredIntegrations.map((integration) => (
                      <Card key={integration.id} className={!integration.isActive ? 'opacity-70' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <Badge variant={integration.isActive ? "outline" : "secondary"} className={integration.isActive ? "bg-success/10 text-success" : ""}>
                              {integration.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <CardDescription>{integration.provider}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm truncate">{integration.endpoint || "No endpoint"}</span>
                            </div>
                            <div className="flex items-center">
                              <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">
                                {integration.apiKey 
                                  ? `${integration.apiKey.substring(0, 4)}...${integration.apiKey.substring(integration.apiKey.length - 4)}` 
                                  : "No API key"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">
                                Added {new Date(integration.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`active-${integration.id}`} className="text-sm">Active</Label>
                            <Switch 
                              id={`active-${integration.id}`}
                              checked={integration.isActive}
                              onCheckedChange={(checked) => 
                                toggleStatusMutation.mutate({ id: integration.id, isActive: checked })
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTestIntegration(integration)}
                            >
                              Test
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditIntegration(integration)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(integration)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center h-32 bg-muted rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <p>No integrations found</p>
                        <Button 
                          variant="link" 
                          onClick={handleAddNewClick}
                          className="mt-2"
                        >
                          Add your first integration
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Add/Edit Integration Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingIntegration ? "Edit Integration" : "Add New Integration"}</DialogTitle>
                <DialogDescription>
                  {editingIntegration 
                    ? "Update the details of your API integration." 
                    : "Connect your premium rate service to an SMS or voice provider."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Twilio SMS" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this integration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Twilio" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the service provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter API key" {...field} />
                          </FormControl>
                          <FormDescription>
                            The API key for authentication.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.example.com/v1" {...field} />
                          </FormControl>
                          <FormDescription>
                            The base URL for API requests.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="configuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Configuration (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"accountSid": "AC123456", "authToken": "auth_token_123"}'
                            rows={5}
                            value={typeof field.value === 'object' 
                              ? JSON.stringify(field.value, null, 2) 
                              : field.value || '{}'}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional configuration parameters in JSON format.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Activate or deactivate this integration
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Integration"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the integration <strong>{integrationToDelete?.name}</strong>?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => integrationToDelete && deleteMutation.mutate(integrationToDelete.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Test Integration Dialog */}
          <Dialog open={isTestingDialogOpen} onOpenChange={setIsTestingDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Test Integration Connection</DialogTitle>
                <DialogDescription>
                  Testing connection to {testingIntegration?.name} ({testingIntegration?.provider})
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6">
                {testIntegrationMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Testing connection to API endpoint...</p>
                  </div>
                ) : testResult ? (
                  <div className={`rounded-lg p-4 ${testResult.success ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center mb-2">
                      {testResult.success ? (
                        <Check className="h-6 w-6 text-success mr-2" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-destructive mr-2" />
                      )}
                      <span className={`font-medium ${testResult.success ? 'text-success' : 'text-destructive'}`}>
                        {testResult.success ? 'Success' : 'Error'}
                      </span>
                    </div>
                    <p className="text-sm">{testResult.message}</p>
                  </div>
                ) : null}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTestingDialogOpen(false)}
                >
                  Close
                </Button>
                {testResult && (
                  <Button 
                    onClick={() => {
                      setTestResult(null);
                      testIntegrationMutation.mutate(testingIntegration!.id);
                    }}
                    disabled={testIntegrationMutation.isPending}
                  >
                    Test Again
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
