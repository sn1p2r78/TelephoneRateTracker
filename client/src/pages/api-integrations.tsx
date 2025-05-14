import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ApiIntegration } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Edit, Power, PowerOff } from 'lucide-react';

// Interface for integration status monitoring
interface IntegrationStatus {
  id: number;
  type: 'smpp' | 'http';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  host?: string;
  port?: number;
  error?: string;
}

// Form data structure for integrations
interface IntegrationFormData {
  name: string;
  provider: string;
  integrationType: string;
  apiKey: string;
  baseUrl?: string;
  endpoint?: string;
  config?: string;
  isActive: boolean;
}

export default function ApiIntegrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('sms');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<IntegrationFormData>({
    name: '',
    provider: '',
    integrationType: 'http',
    apiKey: '',
    baseUrl: '',
    endpoint: '',
    config: '{}',
    isActive: true
  });
  
  // Fetch integrations
  const { data: integrations = [], isLoading: isLoadingIntegrations } = useQuery<ApiIntegration[]>({
    queryKey: ['/api/integrations'],
  });
  
  // Fetch integration status
  const { data: statusData = { smpp: [], http: [] }, isLoading: isLoadingStatus } = useQuery<{
    smpp: IntegrationStatus[],
    http: IntegrationStatus[]
  }>({
    queryKey: ['/api/integrations/status'],
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
  
  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormData) => {
      const res = await apiRequest('POST', '/api/integrations', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration created",
        description: "New integration has been created successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update integration mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IntegrationFormData }) => {
      const res = await apiRequest('PUT', `/api/integrations/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration updated",
        description: "Integration has been updated successfully.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/integrations/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration deleted",
        description: "Integration has been deleted successfully.",
      });
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Connect to integration
  const connectIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/integrations/${id}/connect`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection initiated",
        description: "Attempting to connect to integration...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Disconnect from integration
  const disconnectIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/integrations/${id}/disconnect`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "Integration has been disconnected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Test integration
  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/integrations/${id}/test`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test successful",
        description: "Integration test passed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      integrationType: 'http',
      apiKey: '',
      baseUrl: '',
      endpoint: '',
      config: '{}',
      isActive: true
    });
    setIsEditing(false);
    setSelectedIntegration(null);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data based on integration type
    let submitData = { ...formData };
    
    // For SMPP, format config as JSON
    if (formData.integrationType === 'smpp') {
      try {
        // Parse config if it's a string or create a default config
        const configObj = formData.config ? 
          (typeof formData.config === 'string' ? JSON.parse(formData.config) : formData.config) : 
          {};
          
        submitData.config = JSON.stringify(configObj);
      } catch (error) {
        toast({
          title: "Invalid JSON in config",
          description: "Please provide valid JSON for the config field.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (isEditing && selectedIntegration) {
      updateIntegrationMutation.mutate({ 
        id: selectedIntegration.id, 
        data: submitData 
      });
    } else {
      createIntegrationMutation.mutate(submitData);
    }
  };
  
  // Edit integration
  const handleEditIntegration = (integration: ApiIntegration) => {
    setSelectedIntegration(integration);
    setIsEditing(true);
    
    setFormData({
      name: integration.name,
      provider: integration.provider,
      integrationType: integration.integrationType || 'http',
      apiKey: integration.apiKey || '',
      baseUrl: integration.baseUrl || '',
      endpoint: integration.endpoint || '',
      config: integration.config || '{}',
      isActive: integration.isActive,
    });
  };
  
  // Delete integration
  const handleDeleteClick = (integration: ApiIntegration) => {
    setSelectedIntegration(integration);
    setShowDeleteDialog(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (selectedIntegration) {
      deleteIntegrationMutation.mutate(selectedIntegration.id);
    }
  };
  
  // Handle test integration
  const handleTestIntegration = (integration: ApiIntegration) => {
    testIntegrationMutation.mutate(integration.id);
  };
  
  // Get status badge color and text
  const getStatusBadge = (id: number) => {
    const smppStatus = statusData.smpp.find(s => s.id === id);
    
    if (!smppStatus) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    
    switch (smppStatus.status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-500">Connecting</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };
  
  // Filter integrations by type (for tab display)
  const filteredIntegrations = integrations.filter(
    integration => {
      if (activeTab === 'sms' && (integration.integrationType === 'http' || integration.integrationType === 'smpp')) {
        return true;
      }
      if (activeTab === 'voice' && integration.integrationType === 'voice') {
        return true;
      }
      if (activeTab === 'payments' && integration.integrationType === 'payment') {
        return true;
      }
      return false;
    }
  );
  
  // Create connection button based on type
  const getConnectionButton = (integration: ApiIntegration) => {
    if (integration.integrationType !== 'smpp') {
      return null;
    }
    
    const status = statusData.smpp.find(s => s.id === integration.id);
    const isConnected = status?.status === 'connected';
    
    if (isConnected) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnectIntegrationMutation.mutate(integration.id)}
          disabled={disconnectIntegrationMutation.isPending}
        >
          {disconnectIntegrationMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <PowerOff className="h-4 w-4 mr-1" />
          )}
          Disconnect
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => connectIntegrationMutation.mutate(integration.id)}
          disabled={connectIntegrationMutation.isPending}
        >
          {connectIntegrationMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Power className="h-4 w-4 mr-1" />
          )}
          Connect
        </Button>
      );
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Integrations</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sms">SMS & SMPP</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
              <CardDescription>
                {isEditing ? "Update an existing SMS/SMPP integration" : "Configure a new SMS/SMPP integration"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Integration Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="e.g., Primary SMS Provider"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input 
                      id="provider" 
                      name="provider" 
                      value={formData.provider} 
                      onChange={handleChange} 
                      placeholder="e.g., Twilio, Infobip"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integrationType">Integration Type</Label>
                    <Select 
                      value={formData.integrationType} 
                      onValueChange={(value) => handleSelectChange('integrationType', value)}
                    >
                      <SelectTrigger id="integrationType">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="http">HTTP API</SelectItem>
                        <SelectItem value="smpp">SMPP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      name="apiKey" 
                      value={formData.apiKey} 
                      onChange={handleChange} 
                      placeholder="API Key or Authentication Token"
                    />
                  </div>
                  
                  {formData.integrationType === 'http' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input 
                          id="baseUrl" 
                          name="baseUrl" 
                          value={formData.baseUrl} 
                          onChange={handleChange} 
                          placeholder="e.g., https://api.provider.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endpoint">Endpoint</Label>
                        <Input 
                          id="endpoint" 
                          name="endpoint" 
                          value={formData.endpoint} 
                          onChange={handleChange} 
                          placeholder="e.g., /v1/sms/send"
                        />
                      </div>
                    </>
                  )}
                  
                  {formData.integrationType === 'smpp' && (
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="config">SMPP Configuration (JSON)</Label>
                      <Input 
                        id="config" 
                        name="config" 
                        value={formData.config} 
                        onChange={handleChange} 
                        placeholder='{"host": "smpp.provider.com", "port": 2775, "systemId": "username", "password": "secret", "systemType": "", "connectionType": "trx", "autoConnect": false}'
                      />
                      <p className="text-xs text-gray-500">
                        Host, port, systemId, password, systemType, connectionType (tx/rx/trx), autoConnect
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="isActive" 
                        name="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createIntegrationMutation.isPending || updateIntegrationMutation.isPending}
                  >
                    {(createIntegrationMutation.isPending || updateIntegrationMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? "Update Integration" : "Add Integration"}
                  </Button>
                  
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SMS & SMPP Integrations</CardTitle>
              <CardDescription>
                Manage your SMS and SMPP connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingIntegrations ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No integrations found. Add one above.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredIntegrations.map((integration) => (
                    <div key={integration.id} className="py-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          {integration.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">Inactive</Badge>
                          )}
                          {integration.integrationType === 'smpp' && getStatusBadge(integration.id)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.provider} - {integration.integrationType === 'smpp' ? 'SMPP Connection' : 'HTTP API'}
                        </p>
                        {integration.integrationType === 'smpp' && integration.config && (
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              try {
                                const config = JSON.parse(integration.config);
                                return `${config.host}:${config.port} (${config.connectionType})`;
                              } catch {
                                return 'Invalid configuration';
                              }
                            })()}
                          </p>
                        )}
                        {integration.integrationType === 'http' && integration.baseUrl && (
                          <p className="text-xs text-muted-foreground">
                            {integration.baseUrl}{integration.endpoint}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getConnectionButton(integration)}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditIntegration(integration)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClick(integration)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Integrations</CardTitle>
              <CardDescription>Coming soon - Voice API integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Voice Integrations Coming Soon</h3>
                <p>This feature is under development. Check back later!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>Coming soon - Payment gateway integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Payment Integrations Coming Soon</h3>
                <p>Support for popular payment gateways is under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the integration &quot;{selectedIntegration?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {deleteIntegrationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}