import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Payout, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, ChevronsUp, Wallet } from "lucide-react";

export default function PaymentManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(user?.paymentMethod || "usdt");
  
  // Query to get user's payouts
  const { data: payouts, isLoading, error } = useQuery<Payout[]>({
    queryKey: ["/api/payouts"]
  });
  
  // Handle error separately
  if (error) {
    toast({
      title: "Error loading payouts",
      description: (error as Error).message,
      variant: "destructive",
    });
  }

  // Mutation to request a new payout
  const requestPayoutMutation = useMutation({
    mutationFn: async (data: { amount: number, paymentMethod: string }) => {
      const res = await apiRequest("POST", "/api/payouts", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and is being processed.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payout Request Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to update payment settings
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", "/api/user/payment-settings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Settings Updated",
        description: "Your payment settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRequestPayout = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for payout.",
        variant: "destructive",
      });
      return;
    }

    requestPayoutMutation.mutate({
      amount: parseFloat(amount),
      paymentMethod
    });
  };

  const handleUpdatePaymentSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: Record<string, any> = {
      paymentMethod: formData.get("paymentMethod"),
    };
    
    // Add appropriate fields based on payment method
    if (data.paymentMethod === "bank") {
      data.bankName = formData.get("bankName");
      data.bankAccountNumber = formData.get("bankAccountNumber");
      data.bankRoutingNumber = formData.get("bankRoutingNumber");
    } else if (data.paymentMethod === "usdt") {
      data.usdtAddress = formData.get("usdtAddress");
    }
    
    updatePaymentSettingsMutation.mutate(data as Partial<User>);
  };

  const formatStatus = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Processing</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings and manage your payment details
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${user?.balance?.toFixed(2) || "0.00"}</div>
          </CardContent>
          <CardFooter>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ChevronsUp className="mr-2 h-4 w-4" /> Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Request a payout of your available balance.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdt">USDT</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRequestPayout}
                    disabled={requestPayoutMutation.isPending}
                  >
                    {requestPayoutMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      "Request Payout"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-primary" />
              <div className="text-lg font-semibold capitalize">{user?.paymentMethod || "Not set"}</div>
            </div>
            {user?.paymentMethod === "usdt" && user?.usdtAddress && (
              <p className="text-sm text-muted-foreground mt-2 truncate">Address: {user.usdtAddress}</p>
            )}
            {user?.paymentMethod === "bank" && user?.bankName && (
              <p className="text-sm text-muted-foreground mt-2">Bank: {user.bankName}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                payouts?.filter(p => p.status && p.status.toLowerCase() === 'pending')?.length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="payouts" className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payouts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                View all your payout requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payouts && payouts.length > 0 ? (
                <Table>
                  <TableCaption>Your payout history</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                        <TableCell>${payout.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{payout.paymentMethod}</TableCell>
                        <TableCell>{formatStatus(payout.status)}</TableCell>
                        <TableCell>{payout.transactionId || '-'}</TableCell>
                        <TableCell>{payout.processedAt ? formatDate(payout.processedAt) : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No payout history found. Request your first payout to see it here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Update your payment method and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePaymentSettings} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select 
                      name="paymentMethod"
                      defaultValue={user?.paymentMethod || "usdt"}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdt">USDT (Tether)</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentMethod === "usdt" && (
                    <div className="space-y-2">
                      <Label htmlFor="usdtAddress">USDT Address</Label>
                      <Input
                        id="usdtAddress"
                        name="usdtAddress"
                        placeholder="Enter your USDT address"
                        defaultValue={user?.usdtAddress || ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Please make sure to enter a valid USDT address on the appropriate network (e.g., ERC-20, TRC-20).
                      </p>
                    </div>
                  )}
                  
                  {paymentMethod === "bank" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          name="bankName"
                          placeholder="Enter your bank name"
                          defaultValue={user?.bankName || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankAccountNumber">Account Number</Label>
                        <Input
                          id="bankAccountNumber"
                          name="bankAccountNumber"
                          placeholder="Enter your account number"
                          defaultValue={user?.bankAccountNumber || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                        <Input
                          id="bankRoutingNumber"
                          name="bankRoutingNumber"
                          placeholder="Enter your routing number"
                          defaultValue={user?.bankRoutingNumber || ""}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit"
                  disabled={updatePaymentSettingsMutation.isPending}
                  className="w-full"
                >
                  {updatePaymentSettingsMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : (
                    "Save Payment Settings"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Terms & Information</CardTitle>
          <CardDescription>
            Important information about payments and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Payout Schedule</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Payouts are processed every Monday and Thursday. All requests submitted before
                midnight UTC on the day before will be included in the next payout batch.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Minimum Payout Amount</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The minimum amount for a payout request is $50 USD. Requests below this amount
                will be held until your balance reaches the minimum threshold.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Transaction Fees</h3>
              <p className="text-sm text-muted-foreground mt-1">
                USDT payouts have a flat fee of $5 USD per transaction. Bank transfers may incur
                additional fees depending on your bank and location.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Revenue Calculation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your revenue is calculated based on the usage of your premium rate numbers. 
                The platform retains a service fee of 10% on all transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}