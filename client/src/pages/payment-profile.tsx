import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Copy, CheckCircle, DollarSign, Wallet, CreditCard, Clock, ArrowDownToLine, ArrowUpToLine, RefreshCw, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatDateForDisplay } from '@/lib/utils';

// Sample data for transaction history
const sampleTransactions = [
  { id: 1, type: 'deposit', amount: 500, status: 'completed', date: '2025-05-10T15:32:12Z', txid: '0x9e8b7c6d5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d' },
  { id: 2, type: 'payout', amount: 350, status: 'completed', date: '2025-05-05T09:18:45Z', txid: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s' },
  { id: 3, type: 'payout', amount: 200, status: 'pending', date: '2025-05-15T11:24:36Z', txid: 'pending' },
  { id: 4, type: 'revenue', amount: 125.75, status: 'completed', date: '2025-05-12T14:08:22Z', source: 'SMS Revenue' },
  { id: 5, type: 'revenue', amount: 87.50, status: 'completed', date: '2025-05-11T17:42:59Z', source: 'Call Revenue' },
];

// Helper function to get status badges for transactions
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'failed':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get transaction type icons
const getTransactionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'deposit':
      return <ArrowDownToLine className="h-4 w-4 text-green-600" />;
    case 'payout':
      return <ArrowUpToLine className="h-4 w-4 text-blue-600" />;
    case 'revenue':
      return <DollarSign className="h-4 w-4 text-purple-600" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function PaymentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('payment-settings');
  
  // Form state for payment settings
  const [paymentMethod, setPaymentMethod] = useState(user?.paymentMethod || 'usdt');
  const [formData, setFormData] = useState({
    usdtAddress: user?.usdtAddress || '',
    bankName: user?.bankName || '',
    bankAccountNumber: user?.bankAccountNumber || '',
    bankRoutingNumber: user?.bankRoutingNumber || '',
    minPayoutAmount: '100',
    autoPayouts: false
  });
  
  // Payout request form state
  const [payoutAmount, setPayoutAmount] = useState('');
  
  // Get user payment data
  const { data: paymentData, isLoading: isLoadingPaymentData } = useQuery({
    queryKey: ['/api/user/payment-profile'],
    enabled: !!user,
  });
  
  // Get transaction history
  const { data: transactions = sampleTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/user/transactions'],
    enabled: !!user,
  });
  
  // Mutation for updating payment settings
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/user/payment-settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Your payment settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/payment-profile'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update payment settings.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for requesting a payout
  const requestPayoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/user/request-payout', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payout Requested',
        description: 'Your payout request has been submitted successfully.',
      });
      setPayoutAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      setActiveTab('transaction-history');
    },
    onError: (error: any) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to request payout.',
        variant: 'destructive',
      });
    }
  });
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, autoPayouts: checked }));
  };
  
  const handlePayoutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPayoutAmount(value);
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updatePaymentSettingsMutation.mutate({
      paymentMethod,
      ...formData
    });
  };
  
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(payoutAmount);
    
    // Basic validation
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payout amount.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if amount is less than balance
    const balance = user?.balance || 0;
    if (amount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `Your current balance is ${formatCurrency(balance)}.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Check minimum payout amount
    const minPayout = parseFloat(formData.minPayoutAmount);
    if (!isNaN(minPayout) && amount < minPayout) {
      toast({
        title: 'Amount Too Low',
        description: `Minimum payout amount is ${formatCurrency(minPayout)}.`,
        variant: 'destructive',
      });
      return;
    }
    
    requestPayoutMutation.mutate({
      amount,
      paymentMethod
    });
  };
  
  const handleCopyAddress = () => {
    // Copy user's USDT address to clipboard
    if (formData.usdtAddress) {
      navigator.clipboard.writeText(formData.usdtAddress);
      toast({
        title: 'Address Copied',
        description: 'USDT address copied to clipboard.',
      });
    }
  };
  
  // Filter transactions by type
  const deposits = transactions.filter(tx => tx.type === 'deposit');
  const payouts = transactions.filter(tx => tx.type === 'payout');
  const revenue = transactions.filter(tx => tx.type === 'revenue');
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Profile</h1>
        <p className="text-muted-foreground">
          Manage your payment methods and transaction history
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-5">
        {/* Left column - Payment summary */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Balance</CardTitle>
              <CardDescription>Your current available balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">
                {formatCurrency(user?.balance || 0)}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab('payout-request')}
                >
                  <ArrowUpToLine className="mr-2 h-4 w-4" /> Request Payout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab('transaction-history')}
                >
                  <Clock className="mr-2 h-4 w-4" /> History
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Overview of your recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ArrowDownToLine className="h-4 w-4 mr-2 text-green-600" />
                    <span>Deposits</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(deposits.reduce((sum, tx) => sum + tx.amount, 0))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ArrowUpToLine className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Payouts</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(payouts.reduce((sum, tx) => sum + tx.amount, 0))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Revenue</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(revenue.reduce((sum, tx) => sum + tx.amount, 0))}
                  </span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center">
                  <div className="font-medium">Pending Payouts</div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {formatCurrency(
                      payouts
                        .filter(tx => tx.status.toLowerCase() === 'pending')
                        .reduce((sum, tx) => sum + tx.amount, 0)
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Main content */}
        <div className="md:col-span-3">
          <Tabs defaultValue="payment-settings" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="payment-settings">Payment Settings</TabsTrigger>
              <TabsTrigger value="payout-request">Request Payout</TabsTrigger>
              <TabsTrigger value="transaction-history">Transaction History</TabsTrigger>
            </TabsList>
            
            {/* Payment Settings Tab */}
            <TabsContent value="payment-settings">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Set up your preferred payment method for payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <RadioGroup 
                      value={paymentMethod}
                      onValueChange={handlePaymentMethodChange}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="usdt" id="usdt" />
                        <Label htmlFor="usdt" className="flex items-center cursor-pointer">
                          <Wallet className="mr-2 h-4 w-4" /> USDT (Tether)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center cursor-pointer">
                          <CreditCard className="mr-2 h-4 w-4" /> Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    {paymentMethod === 'usdt' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="usdtAddress">USDT Address (TRC20 Network)</Label>
                          <div className="flex">
                            <Input
                              id="usdtAddress"
                              name="usdtAddress"
                              placeholder="Enter your TRC20 USDT address"
                              value={formData.usdtAddress}
                              onChange={handleInputChange}
                              className="flex-1"
                            />
                            {formData.usdtAddress && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={handleCopyAddress}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Please ensure you provide a valid TRC20 USDT address. Incorrect addresses may result in permanent loss of funds.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            name="bankName"
                            placeholder="Enter your bank name"
                            value={formData.bankName}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bankAccountNumber">Account Number</Label>
                          <Input
                            id="bankAccountNumber"
                            name="bankAccountNumber"
                            placeholder="Enter your account number"
                            value={formData.bankAccountNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                          <Input
                            id="bankRoutingNumber"
                            name="bankRoutingNumber"
                            placeholder="Enter your routing number"
                            value={formData.bankRoutingNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="minPayoutAmount">Minimum Payout Amount (USD)</Label>
                        <Input
                          id="minPayoutAmount"
                          name="minPayoutAmount"
                          type="number"
                          min="50"
                          placeholder="100"
                          value={formData.minPayoutAmount}
                          onChange={handleInputChange}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          System minimum: $50 USD. Recommended: $100 USD or higher.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoPayouts"
                          checked={formData.autoPayouts}
                          onCheckedChange={handleSwitchChange}
                        />
                        <Label htmlFor="autoPayouts">Automatic payouts when balance exceeds minimum</Label>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="button" 
                    onClick={handleSaveSettings}
                    disabled={updatePaymentSettingsMutation.isPending}
                  >
                    {updatePaymentSettingsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Request Payout Tab */}
            <TabsContent value="payout-request">
              <Card>
                <CardHeader>
                  <CardTitle>Request Payout</CardTitle>
                  <CardDescription>
                    Request a payout to your {paymentMethod === 'usdt' ? 'USDT wallet' : 'bank account'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRequestPayout} className="space-y-4">
                    <div className="mb-6">
                      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Important Information</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            You are requesting a payout to your {paymentMethod === 'usdt' ? (
                              <>USDT wallet address ending in <span className="font-mono text-xs bg-yellow-100 px-1 py-0.5 rounded">
                                {formData.usdtAddress ? '...' + formData.usdtAddress.slice(-6) : 'Not set'}
                              </span></>
                            ) : (
                              <>bank account ending in <span className="font-mono text-xs bg-yellow-100 px-1 py-0.5 rounded">
                                {formData.bankAccountNumber ? '...' + formData.bankAccountNumber.slice(-4) : 'Not set'}
                              </span></>
                            )}.
                          </p>
                          {!formData.usdtAddress && paymentMethod === 'usdt' && (
                            <p className="text-sm text-red-600 font-medium mt-2">
                              Please set up your USDT address in the Payment Settings tab before requesting a payout.
                            </p>
                          )}
                          {!formData.bankAccountNumber && paymentMethod === 'bank' && (
                            <p className="text-sm text-red-600 font-medium mt-2">
                              Please set up your bank account details in the Payment Settings tab before requesting a payout.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payoutAmount">Payout Amount (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="payoutAmount"
                          name="payoutAmount"
                          placeholder="0.00"
                          value={payoutAmount}
                          onChange={handlePayoutAmountChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">
                          Minimum: {formatCurrency(parseFloat(formData.minPayoutAmount) || 50)}
                        </span>
                        <span className="text-muted-foreground">
                          Available: {formatCurrency(user?.balance || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={
                          requestPayoutMutation.isPending || 
                          !payoutAmount || 
                          (paymentMethod === 'usdt' && !formData.usdtAddress) ||
                          (paymentMethod === 'bank' && !formData.bankAccountNumber)
                        }
                      >
                        {requestPayoutMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUpToLine className="mr-2 h-4 w-4" />
                        )}
                        Request Payout
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-4">
                      <p className="font-medium mb-1">Processing Times:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>USDT payouts are typically processed within 24 hours.</li>
                        <li>Bank transfers may take 3-5 business days depending on your location.</li>
                        <li>All payouts are subject to review before processing.</li>
                      </ul>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Transaction History Tab */}
            <TabsContent value="transaction-history">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      Recent deposits, payouts, and revenue
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] })}
                    disabled={isLoadingTransactions}
                  >
                    {isLoadingTransactions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No transactions found.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">ID/Reference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {getTransactionIcon(tx.type)}
                                <span className="ml-2 capitalize">{tx.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {tx.type === 'payout' ? '- ' : '+ '}
                              {formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell>{formatDateForDisplay(tx.date)}</TableCell>
                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-mono text-xs truncate max-w-[120px] inline-block">
                                {tx.txid || tx.source || '-'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}