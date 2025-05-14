import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Save, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Setting, insertSettingSchema } from '@shared/schema';
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

// Extend the insertSettingSchema for form validation
const settingFormSchema = z.object({
  key: z.string().min(2, "Key must be at least 2 characters").max(100),
  value: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  description: z.string().optional(),
});

type SettingFormValues = z.infer<typeof settingFormSchema>;

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [settingToDelete, setSettingToDelete] = useState<Setting | null>(null);

  const { toast } = useToast();

  const { data: settings, isLoading, refetch } = useQuery<Setting[]>({
    queryKey: ['/api/settings'],
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: SettingFormValues) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Setting created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsEditDialogOpen(false);
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
    mutationFn: async ({ id, data }: { id: number; data: SettingFormValues }) => {
      const res = await apiRequest("PUT", `/api/settings/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsEditDialogOpen(false);
      setEditingSetting(null);
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
      const res = await apiRequest("DELETE", `/api/settings/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsDeleteDialogOpen(false);
      setSettingToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: {
      key: "",
      value: "",
      category: "",
      description: "",
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddNewClick = () => {
    setEditingSetting(null);
    form.reset({
      key: "",
      value: "",
      category: "",
      description: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSetting = (setting: Setting) => {
    setEditingSetting(setting);
    form.reset({
      key: setting.key,
      value: setting.value || "",
      category: setting.category,
      description: setting.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (setting: Setting) => {
    setSettingToDelete(setting);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: SettingFormValues) => {
    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings?.filter(setting => setting.category === category) || [];
  };

  const categorizedSettings = {
    general: getSettingsByCategory('general'),
    notifications: getSettingsByCategory('notifications'),
    billing: getSettingsByCategory('billing'),
    integrations: getSettingsByCategory('integrations'),
    security: getSettingsByCategory('security'),
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
        <HeaderNav title="Settings" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">System Settings</h1>
              <p className="text-muted-foreground">Configure your premium rate service settings</p>
            </div>
            <Button onClick={handleAddNewClick} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </div>

          {/* Settings Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                          </div>
                        ))
                      ) : categorizedSettings.general.length > 0 ? (
                        categorizedSettings.general.map((setting) => (
                          <div key={setting.id} className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{setting.key}</h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="min-w-[200px] text-right">
                                <Input 
                                  value={setting.value || ''} 
                                  onChange={(e) => {
                                    // In a real app, this would update the setting value
                                  }}
                                  className="ml-auto"
                                />
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetting(setting)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(setting)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No general settings found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-6 w-12" />
                          </div>
                        ))
                      ) : categorizedSettings.notifications.length > 0 ? (
                        categorizedSettings.notifications.map((setting) => (
                          <div key={setting.id} className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{setting.key}</h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {setting.key.includes('email') ? (
                                <div className="min-w-[200px] text-right">
                                  <Input 
                                    value={setting.value || ''} 
                                    onChange={(e) => {
                                      // In a real app, this would update the setting value
                                    }}
                                    className="ml-auto"
                                  />
                                </div>
                              ) : (
                                <Switch
                                  checked={setting.value === 'true'} 
                                  onCheckedChange={() => {}}
                                />
                              )}
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetting(setting)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(setting)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No notification settings found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Billing Settings */}
                <TabsContent value="billing">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                          </div>
                        ))
                      ) : categorizedSettings.billing.length > 0 ? (
                        categorizedSettings.billing.map((setting) => (
                          <div key={setting.id} className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{setting.key}</h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {setting.key === 'default_currency' ? (
                                <Select defaultValue={setting.value || 'USD'}>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="AUD">AUD</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="min-w-[200px] text-right">
                                  <Input 
                                    value={setting.value || ''} 
                                    onChange={(e) => {}}
                                    className="ml-auto"
                                  />
                                </div>
                              )}
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetting(setting)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(setting)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No billing settings found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Integration Settings */}
                <TabsContent value="integrations">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                          </div>
                        ))
                      ) : categorizedSettings.integrations.length > 0 ? (
                        categorizedSettings.integrations.map((setting) => (
                          <div key={setting.id} className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{setting.key}</h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {setting.key.includes('api_provider') ? (
                                <Select defaultValue={setting.value || ''}>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select provider" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="twilio">Twilio</SelectItem>
                                    <SelectItem value="infobip">Infobip</SelectItem>
                                    <SelectItem value="nexmo">Nexmo</SelectItem>
                                    <SelectItem value="dimoka">Dimoka</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="min-w-[200px] text-right">
                                  <Input 
                                    value={setting.value || ''} 
                                    onChange={(e) => {}}
                                    className="ml-auto"
                                    type={setting.key.includes('key') || setting.key.includes('token') ? 'password' : 'text'}
                                  />
                                </div>
                              )}
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetting(setting)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(setting)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No integration settings found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-6 w-12" />
                          </div>
                        ))
                      ) : categorizedSettings.security.length > 0 ? (
                        categorizedSettings.security.map((setting) => (
                          <div key={setting.id} className="flex justify-between items-start border-b pb-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{setting.key}</h4>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {setting.key.includes('enable') ? (
                                <Switch
                                  checked={setting.value === 'true'} 
                                  onCheckedChange={() => {}}
                                />
                              ) : (
                                <div className="min-w-[200px] text-right">
                                  <Input 
                                    value={setting.value || ''} 
                                    onChange={(e) => {}}
                                    className="ml-auto"
                                    type={setting.key.includes('password') || setting.key.includes('secret') ? 'password' : 'text'}
                                  />
                                </div>
                              )}
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetting(setting)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(setting)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No security settings found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Add/Edit Setting Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingSetting ? "Edit Setting" : "Add New Setting"}</DialogTitle>
                <DialogDescription>
                  {editingSetting 
                    ? "Update the details of your system setting." 
                    : "Fill in the details to add a new system setting."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setting Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., default_currency" {...field} />
                        </FormControl>
                        <FormDescription>
                          A unique identifier for this setting.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., USD" {...field} />
                        </FormControl>
                        <FormDescription>
                          The value for this setting.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="notifications">Notifications</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="integrations">Integrations</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category this setting belongs to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Default currency used for billing" {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of what this setting does.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
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
                  Are you sure you want to delete the setting <strong>{settingToDelete?.key}</strong>?
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
                  onClick={() => settingToDelete && deleteMutation.mutate(settingToDelete.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
