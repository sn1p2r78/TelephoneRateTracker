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
import Layout from '@/components/layout';

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
      return <DollarSign className="h-4 w-4" />;
  }
};

export default function PaymentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('wallet');
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [autoPayouts, setAutoPayouts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('usdt');
  
  // Get user payment profile
  const { 
    data: paymentProfile,
    isLoading: isLoadingProfile 
  } = useQuery({
    queryKey: ['/api/user/payment-profile'],
    enabled: !!user,
  });
  
  // Get transaction history
  const { 
    data: transactions = [],
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['/api/user/transactions'],
    enabled: !!user,
  });
  
  // Update payment settings mutation
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
  
  // Withdraw funds mutation
  const withdrawFundsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/user/withdraw', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Requested',
        description: 'Your withdrawal request has been submitted successfully.',
      });
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/user/payment-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal request.',
        variant: 'destructive',
      });
    }
  });
  
  const handleCopyAddress = () => {
    if (paymentProfile?.usdtAddress) {
      navigator.clipboard.writeText(paymentProfile.usdtAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleUpdatePaymentSettings = () => {
    updatePaymentSettingsMutation.mutate({
      paymentMethod,
      autoPayouts,
      bankAccountDetails: paymentProfile?.bankAccountDetails || null,
      usdtAddress: paymentProfile?.usdtAddress || null
    });
  };
  
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }
    
    if (paymentMethod === 'usdt' && !withdrawAddress) {
      toast({
        title: 'Missing Address',
        description: 'Please enter a valid USDT wallet address.',
        variant: 'destructive',
      });
      return;
    }
    
    withdrawFundsMutation.mutate({
      amount,
      paymentMethod,
      address: withdrawAddress || paymentProfile?.usdtAddress
    });
  };
  
  // Calculate balance information from transaction history
  const balanceInfo = React.useMemo(() => {
    if (!Array.isArray(transactions)) return { 
      currentBalance: 0, 
      pendingBalance: 0, 
      totalRevenue: 0, 
      totalWithdrawn: 0 
    };
    
    const depositSum = transactions
      .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const revenueSum = transactions
      .filter(tx => tx.type === 'revenue' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const payoutSum = transactions
      .filter(tx => tx.type === 'payout' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const pendingSum = transactions
      .filter(tx => tx.status === 'pending')
      .reduce((sum, tx) => {
        if (tx.type === 'payout') return sum - tx.amount;
        return sum + tx.amount;
      }, 0);
    
    return {
      currentBalance: depositSum + revenueSum - payoutSum,
      pendingBalance: pendingSum,
      totalRevenue: revenueSum,
      totalWithdrawn: payoutSum
    };
  }, [transactions]);
  
  // Initialize form from payment profile
  React.useEffect(() => {
    if (paymentProfile) {
      setPaymentMethod(paymentProfile.paymentMethod || 'usdt');
      setAutoPayouts(paymentProfile.autoPayouts || false);
      setWithdrawAddress(paymentProfile.usdtAddress || '');
    }
  }, [paymentProfile]);
  
  return (
    <Layout title="Payment Profile">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Payment Profile</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and transactions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Balance</CardTitle>
                <CardDescription>Your current account balance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available</p>
                      <p className="text-3xl font-bold">{formatCurrency(balanceInfo.currentBalance)}</p>
                    </div>
                    
                    {balanceInfo.pendingBalance > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <div className="flex items-center">
                          <p className="text-xl font-medium">{formatCurrency(balanceInfo.pendingBalance)}</p>
                          <Clock className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                        <p className="text-sm font-medium">{formatCurrency(balanceInfo.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                        <p className="text-sm font-medium">{formatCurrency(balanceInfo.totalWithdrawn)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab('withdraw')}
                >
                  Withdraw Funds
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="wallet">My Wallet</TabsTrigger>
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
                <TabsTrigger value="settings">Payment Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Revenue Wallet</CardTitle>
                    <CardDescription>
                      Manage your deposits and revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingProfile ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">USDT Wallet Address</h3>
                            <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              {copied ? 'Copied' : 'Copy'}
                            </Button>
                          </div>
                          <p className="text-sm font-mono bg-background p-2 rounded border break-all">
                            {paymentProfile?.usdtAddress || 'No wallet address set'}
                          </p>
                          <p className="text-xs mt-2 text-muted-foreground">
                            {paymentProfile?.usdtAddress ? 
                              'Use this address to deposit funds to your account or receive payouts.' : 
                              'Please add a USDT wallet address in your payment settings.'}
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Important Information</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Only send USDT (Tether) to this address</li>
                              <li>Supported networks: TRC20, ERC20, BSC</li>
                              <li>Minimum deposit: $10.00</li>
                              <li>Deposits will be credited within 30 minutes after confirmation</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      View all your financial transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground">
                        No transactions found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">Type</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Transaction ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  {getTransactionIcon(transaction.type)}
                                </TableCell>
                                <TableCell>
                                  {formatDateForDisplay(transaction.date)}
                                </TableCell>
                                <TableCell>
                                  {transaction.type === 'revenue' 
                                    ? transaction.source || 'Revenue' 
                                    : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  <span 
                                    className={
                                      transaction.type === 'deposit' || transaction.type === 'revenue' 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                    }
                                  >
                                    {transaction.type === 'deposit' || transaction.type === 'revenue' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {transaction.txid 
                                    ? transaction.txid.length > 10 
                                      ? `${transaction.txid.substring(0, 10)}...` 
                                      : transaction.txid 
                                    : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] })}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      Download Statement
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="withdraw">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdraw Funds</CardTitle>
                    <CardDescription>
                      Request a withdrawal to your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWithdraw} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                          <div className="flex items-center mt-1">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            <Input
                              id="withdraw-amount"
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="10"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="max-w-xs"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum withdrawal: $10.00
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Available balance: <span className="font-medium">{formatCurrency(balanceInfo.currentBalance)}</span>
                          </p>
                        </div>
                        
                        <div>
                          <Label>Payment Method</Label>
                          <RadioGroup 
                            value={paymentMethod} 
                            onValueChange={setPaymentMethod}
                            className="flex flex-col space-y-1 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="usdt" id="payment-usdt" />
                              <Label htmlFor="payment-usdt" className="flex items-center">
                                <Wallet className="h-4 w-4 mr-2 text-green-600" />
                                USDT (Tether)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank" id="payment-bank" />
                              <Label htmlFor="payment-bank" className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                Bank Transfer
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {paymentMethod === 'usdt' && (
                          <div>
                            <Label htmlFor="withdraw-address">USDT Wallet Address</Label>
                            <Input
                              id="withdraw-address"
                              placeholder="Enter your USDT wallet address"
                              value={withdrawAddress}
                              onChange={(e) => setWithdrawAddress(e.target.value)}
                              className="font-mono mt-1"
                            />
                            {paymentProfile?.usdtAddress && (
                              <div className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  id="use-default-address"
                                  className="mr-2"
                                  checked={withdrawAddress === paymentProfile.usdtAddress}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setWithdrawAddress(paymentProfile.usdtAddress);
                                    } else {
                                      setWithdrawAddress('');
                                    }
                                  }}
                                />
                                <Label htmlFor="use-default-address" className="text-sm cursor-pointer">
                                  Use my default wallet address
                                </Label>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {paymentMethod === 'bank' && (
                          <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Your Bank Account Details</h3>
                            {paymentProfile?.bankAccountDetails ? (
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Account holder:</span> {paymentProfile.bankAccountDetails.accountHolder}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Account number:</span> {paymentProfile.bankAccountDetails.accountNumber}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Bank name:</span> {paymentProfile.bankAccountDetails.bankName}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Swift/BIC:</span> {paymentProfile.bankAccountDetails.swiftCode}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No bank account details found. Please add your bank account details in payment settings.
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Amount:</span>
                            <span className="text-sm font-medium">{formatCurrency(parseFloat(withdrawAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Fee:</span>
                            <span className="text-sm font-medium">{paymentMethod === 'usdt' ? '$1.00' : '$25.00'}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">You'll Receive:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency((parseFloat(withdrawAmount) || 0) - (paymentMethod === 'usdt' ? 1 : 25))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab('wallet')}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdraw}
                      disabled={withdrawFundsMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    >
                      {withdrawFundsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Request Withdrawal
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>
                      Manage your payment methods and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingProfile ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>Default Payment Method</Label>
                          <RadioGroup 
                            value={paymentMethod} 
                            onValueChange={setPaymentMethod}
                            className="flex flex-col space-y-1 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="usdt" id="setting-usdt" />
                              <Label htmlFor="setting-usdt" className="flex items-center">
                                <Wallet className="h-4 w-4 mr-2 text-green-600" />
                                USDT (Tether)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank" id="setting-bank" />
                              <Label htmlFor="setting-bank" className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                Bank Transfer
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <Label htmlFor="usdt-address">USDT Wallet Address</Label>
                          <Input
                            id="usdt-address"
                            placeholder="Enter your USDT wallet address"
                            value={paymentProfile?.usdtAddress || ''}
                            onChange={(e) => updatePaymentSettingsMutation.mutate({
                              ...paymentProfile,
                              usdtAddress: e.target.value
                            })}
                            className="font-mono mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Make sure to enter a valid USDT address that supports TRC20, ERC20, or BSC networks
                          </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Bank Account Details</h3>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="account-holder">Account Holder Name</Label>
                              <Input
                                id="account-holder"
                                placeholder="Enter account holder name"
                                value={paymentProfile?.bankAccountDetails?.accountHolder || ''}
                                onChange={(e) => {
                                  const updatedDetails = {
                                    ...paymentProfile,
                                    bankAccountDetails: {
                                      ...(paymentProfile?.bankAccountDetails || {}),
                                      accountHolder: e.target.value
                                    }
                                  };
                                  updatePaymentSettingsMutation.mutate(updatedDetails);
                                }}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="account-number">Account Number / IBAN</Label>
                                <Input
                                  id="account-number"
                                  placeholder="Enter account number"
                                  value={paymentProfile?.bankAccountDetails?.accountNumber || ''}
                                  onChange={(e) => {
                                    const updatedDetails = {
                                      ...paymentProfile,
                                      bankAccountDetails: {
                                        ...(paymentProfile?.bankAccountDetails || {}),
                                        accountNumber: e.target.value
                                      }
                                    };
                                    updatePaymentSettingsMutation.mutate(updatedDetails);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="bank-name">Bank Name</Label>
                                <Input
                                  id="bank-name"
                                  placeholder="Enter bank name"
                                  value={paymentProfile?.bankAccountDetails?.bankName || ''}
                                  onChange={(e) => {
                                    const updatedDetails = {
                                      ...paymentProfile,
                                      bankAccountDetails: {
                                        ...(paymentProfile?.bankAccountDetails || {}),
                                        bankName: e.target.value
                                      }
                                    };
                                    updatePaymentSettingsMutation.mutate(updatedDetails);
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="swift-code">Swift/BIC Code</Label>
                                <Input
                                  id="swift-code"
                                  placeholder="Enter SWIFT/BIC code"
                                  value={paymentProfile?.bankAccountDetails?.swiftCode || ''}
                                  onChange={(e) => {
                                    const updatedDetails = {
                                      ...paymentProfile,
                                      bankAccountDetails: {
                                        ...(paymentProfile?.bankAccountDetails || {}),
                                        swiftCode: e.target.value
                                      }
                                    };
                                    updatePaymentSettingsMutation.mutate(updatedDetails);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="bank-address">Bank Address</Label>
                                <Input
                                  id="bank-address"
                                  placeholder="Enter bank address"
                                  value={paymentProfile?.bankAccountDetails?.bankAddress || ''}
                                  onChange={(e) => {
                                    const updatedDetails = {
                                      ...paymentProfile,
                                      bankAccountDetails: {
                                        ...(paymentProfile?.bankAccountDetails || {}),
                                        bankAddress: e.target.value
                                      }
                                    };
                                    updatePaymentSettingsMutation.mutate(updatedDetails);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="auto-payouts"
                            checked={autoPayouts}
                            onCheckedChange={setAutoPayouts}
                          />
                          <Label htmlFor="auto-payouts" className="cursor-pointer">
                            Automatic payouts when balance exceeds $100
                          </Label>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpdatePaymentSettings}
                      disabled={updatePaymentSettingsMutation.isPending}
                    >
                      {updatePaymentSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}