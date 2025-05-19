import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  Info,
  RefreshCw,
  Wallet,
} from "lucide-react";

export default function PaymentProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<string>("usdt");
  const [usdtAddress, setUsdtAddress] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState<string>("");
  const [formChanged, setFormChanged] = useState(false);
  
  // Loading user payment data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user/payment-profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/payment-profile");
      return await response.json();
    },
  });

  // Payment history data
  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/payment-history"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/payment-history");
      return await response.json();
    },
  });

  // Update payment profile mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user/payment-settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/payment-profile"] });
      setFormChanged(false);
      toast({
        title: "Payment Settings Updated",
        description: "Your payment settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (userData) {
      setPaymentMethod(userData.paymentMethod || "usdt");
      setUsdtAddress(userData.usdtAddress || "");
      setBankName(userData.bankName || "");
      setBankAccountNumber(userData.bankAccountNumber || "");
      setBankRoutingNumber(userData.bankRoutingNumber || "");
    }
  }, [userData]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormChanged(true);
    
    switch (field) {
      case "paymentMethod":
        setPaymentMethod(value);
        break;
      case "usdtAddress":
        setUsdtAddress(value);
        break;
      case "bankName":
        setBankName(value);
        break;
      case "bankAccountNumber":
        setBankAccountNumber(value);
        break;
      case "bankRoutingNumber":
        setBankRoutingNumber(value);
        break;
    }
  };

  const handleSavePaymentSettings = () => {
    const paymentData: any = {
      paymentMethod
    };

    if (paymentMethod === "usdt") {
      if (!usdtAddress) {
        toast({
          title: "USDT Address Required",
          description: "Please enter your USDT wallet address.",
          variant: "destructive",
        });
        return;
      }
      paymentData.usdtAddress = usdtAddress;
    } else if (paymentMethod === "bank") {
      if (!bankName || !bankAccountNumber || !bankRoutingNumber) {
        toast({
          title: "Bank Details Required",
          description: "Please enter all required bank account details.",
          variant: "destructive",
        });
        return;
      }
      paymentData.bankName = bankName;
      paymentData.bankAccountNumber = bankAccountNumber;
      paymentData.bankRoutingNumber = bankRoutingNumber;
    }

    updatePaymentMutation.mutate(paymentData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Payment Profile" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Payment Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your payment settings and view your payment history
              </p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Payment Settings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Choose how you want to receive your earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select 
                          value={paymentMethod} 
                          onValueChange={(value) => handleInputChange("paymentMethod", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usdt">
                              <div className="flex items-center">
                                <Wallet className="mr-2 h-4 w-4" />
                                USDT (TRC20)
                              </div>
                            </SelectItem>
                            <SelectItem value="bank">
                              <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Bank Transfer
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod === "usdt" && (
                        <div className="space-y-2">
                          <Label htmlFor="usdtAddress">USDT Wallet Address (TRC20)</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="usdtAddress"
                              value={usdtAddress}
                              onChange={(e) => handleInputChange("usdtAddress", e.target.value)}
                              placeholder="Enter your TRC20 wallet address"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Make sure to provide a valid TRC20 network wallet address to receive USDT payments
                          </p>
                        </div>
                      )}

                      {paymentMethod === "bank" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                              id="bankName"
                              value={bankName}
                              onChange={(e) => handleInputChange("bankName", e.target.value)}
                              placeholder="Enter your bank name"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bankAccountNumber">Account Number</Label>
                              <Input
                                id="bankAccountNumber"
                                value={bankAccountNumber}
                                onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                                placeholder="Enter your account number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                              <Input
                                id="bankRoutingNumber"
                                value={bankRoutingNumber}
                                onChange={(e) => handleInputChange("bankRoutingNumber", e.target.value)}
                                placeholder="Enter routing/SWIFT number"
                              />
                            </div>
                          </div>
                          
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>International Bank Transfers</AlertTitle>
                            <AlertDescription>
                              For international bank transfers, please ensure your banking details are complete and accurate. Additional fees may apply for international transfers.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button 
                    onClick={handleSavePaymentSettings} 
                    disabled={updatePaymentMutation.isPending || !formChanged}
                  >
                    {updatePaymentMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : "Save Payment Settings"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>
                    Your earnings and payment status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
                        <p className="text-2xl font-bold">{formatCurrency(userData?.balance || 0)}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Payment Status</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <p className="text-sm">Ready for payout</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium mb-2">Payment Details</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Minimum Payout</p>
                          <p className="text-sm font-medium">$50.00</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Payment Schedule</p>
                          <p className="text-sm font-medium">Monthly</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Next Payout Date</p>
                          <p className="text-sm font-medium">June 15, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/payment-management">
                      Request Payout
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Payment History */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      Your recent payments and transactions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="payouts">
                  <TabsList className="mb-4">
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="payouts">
                    {historyLoading ? (
                      <div className="py-12 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : !paymentHistory?.payouts || paymentHistory.payouts.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <DollarSign className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Payouts Yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          You haven't received any payouts yet. Once you accumulate sufficient earnings, you'll be able to request a payout.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {paymentHistory.payouts.map((payout: any) => (
                          <div key={payout.id} className="p-4 flex justify-between items-center">
                            <div className="flex items-start space-x-4">
                              <div className={`p-2 rounded-full ${
                                payout.status === 'completed' 
                                  ? 'bg-green-100' 
                                  : payout.status === 'pending' 
                                    ? 'bg-yellow-100' 
                                    : 'bg-gray-100'
                              }`}>
                                {payout.status === 'completed' ? (
                                  <CheckCircle className={`h-4 w-4 text-green-600`} />
                                ) : payout.status === 'pending' ? (
                                  <RefreshCw className={`h-4 w-4 text-yellow-600`} />
                                ) : (
                                  <AlertCircle className={`h-4 w-4 text-gray-600`} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">Payout #{payout.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payout.paymentMethod === 'usdt' 
                                    ? 'USDT Transfer' 
                                    : 'Bank Transfer'
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(payout.requestedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(payout.amount)}</p>
                              <p className={`text-xs ${
                                payout.status === 'completed' 
                                  ? 'text-green-600' 
                                  : payout.status === 'pending' 
                                    ? 'text-yellow-600' 
                                    : 'text-gray-600'
                              }`}>
                                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="earnings">
                    {historyLoading ? (
                      <div className="py-12 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : !paymentHistory?.earnings || paymentHistory.earnings.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <DollarSign className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Earnings Yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          You haven't earned any revenue yet. Start receiving calls and messages to your premium rate numbers to generate earnings.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {paymentHistory.earnings.map((earning: any) => (
                          <div key={earning.id} className="p-4 flex justify-between items-center">
                            <div className="flex items-start space-x-4">
                              <div className={`p-2 rounded-full ${
                                earning.type === 'call' 
                                  ? 'bg-blue-100' 
                                  : 'bg-green-100'
                              }`}>
                                {earning.type === 'call' ? (
                                  <CreditCard className={`h-4 w-4 text-blue-600`} />
                                ) : (
                                  <CreditCard className={`h-4 w-4 text-green-600`} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {earning.type === 'call' 
                                    ? `Call revenue from ${earning.number}` 
                                    : `SMS revenue from ${earning.number}`
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {earning.type === 'call' 
                                    ? `Duration: ${earning.duration}s` 
                                    : `${earning.messageCount} messages`
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(earning.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(earning.amount)}</p>
                              <p className="text-xs text-green-600">
                                Credited to account
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}