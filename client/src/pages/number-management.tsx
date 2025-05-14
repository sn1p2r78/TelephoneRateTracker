import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Hash, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { insertNumberSchema, Number as PRNumber } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Extend the insertNumberSchema for form validation
const numberFormSchema = z.object({
  number: z.string().min(5, "Number must be at least 5 characters"),
  countryCode: z.string().min(2, "Country code is required"),
  type: z.enum(["VOICE", "SMS", "COMBINED"]),
  serviceType: z.string().min(3, "Service type is required"),
  ratePerMinute: z.union([
    z.number().min(0.01, "Rate must be greater than 0").optional(),
    z.literal(null)
  ]).optional(),
  ratePerSMS: z.union([
    z.number().min(0.01, "Rate must be greater than 0").optional(),
    z.literal(null)
  ]).optional(),
  isActive: z.boolean().default(true),
});

type NumberFormValues = z.infer<typeof numberFormSchema>;

export default function NumberManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [editingNumber, setEditingNumber] = useState<PRNumber | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<PRNumber | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: numbers, isLoading, refetch } = useQuery<PRNumber[]>({
    queryKey: ['/api/numbers'],
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: NumberFormValues) => {
      const res = await apiRequest("POST", "/api/numbers", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Premium rate number created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/numbers'] });
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
    mutationFn: async ({ id, data }: { id: number; data: NumberFormValues }) => {
      const res = await apiRequest("PUT", `/api/numbers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Premium rate number updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/numbers'] });
      setIsFormOpen(false);
      setEditingNumber(null);
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
      const res = await apiRequest("DELETE", `/api/numbers/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Number deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/numbers'] });
      setIsDeleteDialogOpen(false);
      setNumberToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<NumberFormValues>({
    resolver: zodResolver(numberFormSchema),
    defaultValues: {
      number: "",
      countryCode: "",
      type: "VOICE",
      serviceType: "",
      ratePerMinute: null,
      ratePerSMS: null,
      isActive: true,
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEditNumber = (number: PRNumber) => {
    setEditingNumber(number);
    form.reset({
      number: number.number,
      countryCode: number.countryCode,
      type: number.type,
      serviceType: number.serviceType,
      ratePerMinute: number.ratePerMinute || null,
      ratePerSMS: number.ratePerSMS || null,
      isActive: number.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (number: PRNumber) => {
    setNumberToDelete(number);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingNumber(null);
    form.reset({
      number: "",
      countryCode: "",
      type: "VOICE",
      serviceType: "",
      ratePerMinute: null,
      ratePerSMS: null,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: NumberFormValues) => {
    if (editingNumber) {
      updateMutation.mutate({ id: editingNumber.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Type-specific form fields based on the selected type
  const typeSpecificFields = () => {
    const type = form.watch('type');
    
    if (type === 'VOICE') {
      return (
        <FormField
          control={form.control}
          name="ratePerMinute"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate Per Minute ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 1.50" 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    } else if (type === 'SMS') {
      return (
        <FormField
          control={form.control}
          name="ratePerSMS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate Per SMS ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 1.50" 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    } else {
      return (
        <>
          <FormField
            control={form.control}
            name="ratePerMinute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Per Minute ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 1.50" 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value === null ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ratePerSMS"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Per SMS ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 1.50" 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value === null ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }
  };

  const filteredNumbers = numbers?.filter(number => {
    const matchesSearch = 
      number.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      number.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = filterCountry === 'all' || number.countryCode === filterCountry;
    const matchesType = filterType === 'all' || number.type === filterType;
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && number.isActive) || 
      (filterActive === 'inactive' && !number.isActive);
    
    return matchesSearch && matchesCountry && matchesType && matchesActive;
  });

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
        <HeaderNav title="Number Management" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Premium Rate Numbers</h1>
              <p className="text-muted-foreground">Manage your premium rate numbers</p>
            </div>
            <Button onClick={handleAddNewClick} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Number
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search numbers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Country</Label>
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by country" />
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
                  <Label className="text-sm">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="VOICE">Voice</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="COMBINED">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Status</Label>
                  <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Numbers Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Number</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Country</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Service</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3 px-5"><Skeleton className="h-5 w-32" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-20" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-28" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                        <td className="py-3 px-5"><Skeleton className="h-5 w-20" /></td>
                      </tr>
                    ))
                  ) : filteredNumbers && filteredNumbers.length > 0 ? (
                    filteredNumbers.map((number) => (
                      <tr 
                        key={number.id} 
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm font-medium">{number.number}</td>
                        <td className="py-3 px-5 text-sm">{number.countryCode}</td>
                        <td className="py-3 px-5 text-sm">
                          <Badge 
                            variant="outline" 
                            className={`${
                              number.type === 'VOICE' 
                                ? 'bg-primary/10 text-primary' 
                                : number.type === 'SMS'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-success/10 text-success'
                            } rounded-full`}
                          >
                            {number.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-sm">{number.serviceType}</td>
                        <td className="py-3 px-5 text-sm">
                          {number.type === 'VOICE' 
                            ? `$${number.ratePerMinute?.toFixed(2)}/min` 
                            : number.type === 'SMS'
                            ? `$${number.ratePerSMS?.toFixed(2)}/sms`
                            : `$${number.ratePerMinute?.toFixed(2)}/min, $${number.ratePerSMS?.toFixed(2)}/sms`}
                        </td>
                        <td className="py-3 px-5 text-sm">
                          <Badge 
                            variant="outline" 
                            className={`${
                              number.isActive
                                ? 'bg-success/10 text-success' 
                                : 'bg-destructive/10 text-destructive'
                            } rounded-full`}
                          >
                            {number.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-sm">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary h-8 w-8"
                            onClick={() => handleEditNumber(number)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-8 w-8"
                            onClick={() => handleDeleteClick(number)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No premium rate numbers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredNumbers ? `Showing ${filteredNumbers.length} of ${numbers?.length} numbers` : "No numbers"}
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
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>

          {/* Add/Edit Number Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingNumber ? "Edit Number" : "Add New Number"}</DialogTitle>
                <DialogDescription>
                  {editingNumber 
                    ? "Update the details of your premium rate number." 
                    : "Fill in the details to add a new premium rate number."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+44 7700 900123" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the full premium rate number with country code.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="JP">Japan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VOICE">Voice</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="COMBINED">Combined</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Support Hotline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Dynamic fields based on type */}
                  {typeSpecificFields()}
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Activate or deactivate this premium rate number
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
                  Are you sure you want to delete the number <strong>{numberToDelete?.number}</strong>?
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
                  onClick={() => numberToDelete && deleteMutation.mutate(numberToDelete.id)}
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
