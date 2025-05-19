import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Loader2, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: number;
  phoneNumber: string;
  messageText: string;
  timestamp: string;
  isProcessed: boolean;
  responseText: string | null;
  responseTimestamp: string | null;
  username?: string;
  provider?: string;
  range?: string;
  price?: number;
}

export default function CDIREnhancedPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const userRole = user?.role || 'user';
  const isAdminOrSupport = userRole === 'admin' || userRole === 'support';
  
  // Date filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // For admin/support: Fetch all messages
  // For regular users: Fetch only their messages
  const { data: allMessages, isLoading, refetch } = useQuery<Message[]>({
    queryKey: [isAdminOrSupport ? "/api/messages/all" : "/api/messages/user"],
    queryFn: async () => {
      const endpoint = isAdminOrSupport ? "/api/messages" : "/api/messages/user";
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch message history");
      return res.json();
    },
  });

  const { data: numberMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/number", selectedNumber],
    queryFn: async () => {
      if (!selectedNumber) return [];
      const res = await fetch(`/api/messages/number/${selectedNumber}`);
      if (!res.ok) throw new Error("Failed to fetch messages for number");
      return res.json();
    },
    enabled: !!selectedNumber,
  });

  // Filter messages based on search query
  const filteredMessages = allMessages?.filter(
    (message) =>
      message.phoneNumber.includes(searchQuery) ||
      message.messageText.includes(searchQuery) ||
      (message.responseText && message.responseText.includes(searchQuery)) ||
      (isAdminOrSupport && message.username && message.username.includes(searchQuery))
  );
  
  // Time-based filter functions
  const isMessageFromDate = (messageDate: string, selectedDate: Date): boolean => {
    const date = new Date(messageDate);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isMessageFromMonth = (messageDate: string, yearMonth: string): boolean => {
    const date = new Date(messageDate);
    const [year, month] = yearMonth.split('-').map(n => parseInt(n));
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  };

  const isMessageFromYear = (messageDate: string, year: number): boolean => {
    const date = new Date(messageDate);
    return date.getFullYear() === year;
  };
  
  // Filtered message sets
  const dailyMessages = React.useMemo(() => {
    return allMessages?.filter(message => isMessageFromDate(message.timestamp, selectedDate)) || [];
  }, [allMessages, selectedDate]);

  const monthlyMessages = React.useMemo(() => {
    return allMessages?.filter(message => isMessageFromMonth(message.timestamp, selectedMonth)) || [];
  }, [allMessages, selectedMonth]);

  const yearlyMessages = React.useMemo(() => {
    return allMessages?.filter(message => isMessageFromYear(message.timestamp, selectedYear)) || [];
  }, [allMessages, selectedYear]);

  // Get unique phone numbers from all messages
  const uniqueNumbers = React.useMemo(() => {
    if (!allMessages) return [];
    
    // Create a map to track unique numbers
    const uniqueMap: Record<string, boolean> = {};
    allMessages.forEach(message => {
      uniqueMap[message.phoneNumber] = true;
    });
    
    // Return array of unique numbers
    return Object.keys(uniqueMap);
  }, [allMessages]);

  const handleRefresh = () => {
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Renders message table headers based on user role
  const renderTableHeaders = () => {
    if (isAdminOrSupport) {
      return (
        <TableRow>
          <TableHead className="w-[100px]">Date</TableHead>
          <TableHead className="w-[150px]">Number</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Response</TableHead>
          <TableHead className="w-[100px]">Range</TableHead>
          <TableHead className="w-[100px]">Price</TableHead>
          <TableHead className="w-[120px]">Username</TableHead>
          <TableHead className="w-[120px]">Provider</TableHead>
        </TableRow>
      );
    } else {
      return (
        <TableRow>
          <TableHead className="w-[100px]">Date</TableHead>
          <TableHead className="w-[150px]">Number</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Response</TableHead>
          <TableHead className="w-[100px]">Range</TableHead>
          <TableHead className="w-[100px]">Price</TableHead>
          <TableHead className="w-[120px]">Provider</TableHead>
        </TableRow>
      );
    }
  };

  // Renders message data cells based on user role
  const renderTableCells = (message: Message) => {
    if (isAdminOrSupport) {
      return (
        <TableRow key={message.id}>
          <TableCell className="whitespace-nowrap">
            {formatDate(message.timestamp)}
          </TableCell>
          <TableCell>{message.phoneNumber}</TableCell>
          <TableCell>{message.messageText}</TableCell>
          <TableCell>
            {message.responseText ? (
              <div>
                <p>{message.responseText}</p>
                {message.responseTimestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(message.responseTimestamp)}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">No response</span>
            )}
          </TableCell>
          <TableCell>{message.range || '-'}</TableCell>
          <TableCell>{formatCurrency(message.price)}</TableCell>
          <TableCell>{message.username || '-'}</TableCell>
          <TableCell>{message.provider || '-'}</TableCell>
        </TableRow>
      );
    } else {
      return (
        <TableRow key={message.id}>
          <TableCell className="whitespace-nowrap">
            {formatDate(message.timestamp)}
          </TableCell>
          <TableCell>{message.phoneNumber}</TableCell>
          <TableCell>{message.messageText}</TableCell>
          <TableCell>
            {message.responseText ? (
              <div>
                <p>{message.responseText}</p>
                {message.responseTimestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(message.responseTimestamp)}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">No response</span>
            )}
          </TableCell>
          <TableCell>{message.range || '-'}</TableCell>
          <TableCell>{formatCurrency(message.price)}</TableCell>
          <TableCell>{message.provider || '-'}</TableCell>
        </TableRow>
      );
    }
  };

  return (
    <Layout title="CDIR (Message History)">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Message History (CDIR)</h1>
          <p className="text-muted-foreground">
            View and manage all incoming messages and their responses
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="by-number">By Number</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Incoming Messages</CardTitle>
                <CardDescription>
                  Complete history of all incoming messages and their responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !filteredMessages?.length ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {filteredMessages.map((message) => renderTableCells(message))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-number">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Phone Numbers</CardTitle>
                  <CardDescription>
                    Select a number to view its messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !uniqueNumbers.length ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No numbers found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uniqueNumbers.map((number) => (
                        <Button
                          key={number}
                          variant={selectedNumber === number ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedNumber(number)}
                        >
                          {number}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>
                    {selectedNumber ? (
                      <>Messages for {selectedNumber}</>
                    ) : (
                      <>Select a Number</>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedNumber
                      ? "Conversation history with this number"
                      : "Choose a number from the list to view its message history"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedNumber ? (
                    !numberMessages?.length ? (
                      <div className="text-center p-8 text-muted-foreground">
                        No messages found for this number
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {numberMessages.map((message) => (
                          <div
                            key={message.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">
                                {message.phoneNumber}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <div className="mb-4">
                              <p className="bg-muted p-3 rounded-lg inline-block max-w-[80%]">
                                {message.messageText}
                              </p>
                            </div>
                            {message.responseText && (
                              <div className="flex flex-col items-end">
                                <p className="bg-primary text-primary-foreground p-3 rounded-lg inline-block max-w-[80%]">
                                  {message.responseText}
                                </p>
                                {message.responseTimestamp && (
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {formatDate(message.responseTimestamp)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center p-12 text-muted-foreground">
                      Please select a number from the list
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Messages</CardTitle>
                <CardDescription>
                  Messages received on {format(selectedDate, 'MMMM d, yyyy')}
                </CardDescription>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                    >
                      Previous Day
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                    >
                      Next Day
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !dailyMessages.length ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No messages found for this day
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {dailyMessages.map((message) => renderTableCells(message))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Messages</CardTitle>
                <CardDescription>
                  Messages received in {format(new Date(`${selectedMonth}-01`), 'MMMM yyyy')}
                </CardDescription>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const date = new Date();
                        setSelectedMonth(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
                      }}
                    >
                      Current Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !monthlyMessages.length ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No messages found for this month
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {monthlyMessages.map((message) => renderTableCells(message))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yearly">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Messages</CardTitle>
                <CardDescription>
                  Messages received in {selectedYear}
                </CardDescription>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedYear(selectedYear - 1)}
                    >
                      Previous Year
                    </Button>
                    <Input 
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="max-w-[100px]"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedYear(selectedYear + 1)}
                    >
                      Next Year
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedYear(new Date().getFullYear())}
                    >
                      Current Year
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !yearlyMessages.length ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No messages found for this year
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {yearlyMessages.map((message) => renderTableCells(message))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}