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
import { Search, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderNav from "@/components/header-nav";
import SidebarNav from "@/components/sidebar-nav";

interface Message {
  id: number;
  phoneNumber: string;
  messageText: string;
  timestamp: string;
  isProcessed: boolean;
  responseText: string | null;
  responseTimestamp: string | null;
}

export default function CDIRPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  
  // Date filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: allMessages, isLoading, refetch } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
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
      (message.responseText && message.responseText.includes(searchQuery))
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="CDIR (Message History)" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Message History (CDIR)</h1>
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
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !filteredMessages?.length ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No messages found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead className="w-[150px]">Number</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMessages.map((message) => (
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
                              <TableCell>
                                <Badge
                                  variant={message.isProcessed ? "default" : "outline"}
                                  className={message.isProcessed ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {message.isProcessed ? "Processed" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
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
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
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
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !dailyMessages.length ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No messages found for this day
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead className="w-[150px]">Number</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyMessages.map((message) => (
                            <TableRow key={message.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(message.timestamp), "HH:mm:ss")}
                              </TableCell>
                              <TableCell>{message.phoneNumber}</TableCell>
                              <TableCell>{message.messageText}</TableCell>
                              <TableCell>
                                {message.responseText ? (
                                  <div>
                                    <p>{message.responseText}</p>
                                    {message.responseTimestamp && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(message.responseTimestamp), "HH:mm:ss")}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No response</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={message.isProcessed ? "default" : "outline"}
                                  className={message.isProcessed ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {message.isProcessed ? "Processed" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
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
                    Messages received in {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                  </CardDescription>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <select 
                        className="px-2 py-1 border rounded-md"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          const monthStr = month.toString().padStart(2, '0');
                          return (
                            <option key={monthStr} value={`${selectedYear}-${monthStr}`}>
                              {format(new Date(`${selectedYear}-${monthStr}-01`), 'MMMM')}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        className="px-2 py-1 border rounded-md"
                        value={selectedYear}
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value);
                          setSelectedYear(newYear);
                          setSelectedMonth(`${newYear}-${selectedMonth.split('-')[1]}`);
                        }}
                      >
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !monthlyMessages.length ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No messages found for this month
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead className="w-[150px]">Number</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthlyMessages.map((message) => (
                            <TableRow key={message.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(message.timestamp), "MMM dd, HH:mm")}
                              </TableCell>
                              <TableCell>{message.phoneNumber}</TableCell>
                              <TableCell>{message.messageText}</TableCell>
                              <TableCell>
                                {message.responseText ? (
                                  <div>
                                    <p>{message.responseText}</p>
                                    {message.responseTimestamp && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(message.responseTimestamp), "MMM dd, HH:mm")}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No response</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={message.isProcessed ? "default" : "outline"}
                                  className={message.isProcessed ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {message.isProcessed ? "Processed" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
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
                      <span className="font-semibold px-4">{selectedYear}</span>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedYear(selectedYear + 1)}
                      >
                        Next Year
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !yearlyMessages.length ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No messages found for this year
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead className="w-[150px]">Number</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {yearlyMessages.map((message) => (
                            <TableRow key={message.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(message.timestamp), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{message.phoneNumber}</TableCell>
                              <TableCell>{message.messageText}</TableCell>
                              <TableCell>
                                {message.responseText ? (
                                  <div>
                                    <p>{message.responseText}</p>
                                    {message.responseTimestamp && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(message.responseTimestamp), "MMM dd, yyyy")}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No response</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={message.isProcessed ? "default" : "outline"}
                                  className={message.isProcessed ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {message.isProcessed ? "Processed" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}