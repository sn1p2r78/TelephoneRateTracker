import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderNav from "@/components/header-nav";
import SidebarNav from "@/components/sidebar-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, CheckIcon, ClipboardCopy, PlayIcon, RefreshCw, InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function WebhookTesterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smsNumber, setSmsNumber] = useState("");
  const [smsText, setSmsText] = useState("Hello World");
  const [smsDate, setSmsDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Query mode state
  const [queryType, setQueryType] = useState("sms");
  const [queryNumber, setQueryNumber] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [queryLimit, setQueryLimit] = useState("100");
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const resetState = () => {
    setLoading(false);
    setResults(null);
    setError(null);
  };
  
  const handleSendSMS = async () => {
    if (!smsNumber || !smsText) {
      setError("Number and message text are required");
      return;
    }
    
    resetState();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/webhooks/sms?number=${encodeURIComponent(smsNumber)}&text=${encodeURIComponent(smsText)}&datetime=${encodeURIComponent(smsDate.toISOString())}`);
      const data = await response.json();
      
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQueryData = async () => {
    if (!queryNumber) {
      setError("Phone number is required for querying data");
      return;
    }
    
    resetState();
    setLoading(true);
    
    try {
      let endpoint = "/api/webhooks/generic";
      
      const params = new URLSearchParams({
        provider: queryType,
        query: "historical",
        number: queryNumber,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        limit: queryLimit
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();
      
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const copyResults = () => {
    if (results) {
      navigator.clipboard.writeText(results);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Webhook Tester" toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Webhook Tester</h1>
              <p className="text-muted-foreground">
                Test webhooks and query the system's data with this interactive tool
              </p>
            </div>
            
            <Tabs defaultValue="send">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="send" className="flex-1">Send Messages</TabsTrigger>
                <TabsTrigger value="query" className="flex-1">Query Data</TabsTrigger>
                <TabsTrigger value="docs" className="flex-1">Documentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="send">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send SMS</CardTitle>
                      <CardDescription>
                        Send a test SMS message to the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="smsNumber">Phone Number</Label>
                        <Input
                          id="smsNumber"
                          placeholder="e.g. 123456789"
                          value={smsNumber}
                          onChange={(e) => setSmsNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smsText">Message Text</Label>
                        <Textarea
                          id="smsText"
                          placeholder="Enter message content"
                          value={smsText}
                          onChange={(e) => setSmsText(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Message Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(smsDate, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={smsDate}
                              onSelect={(date) => date && setSmsDate(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleSendSMS} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlayIcon className="mr-2 h-4 w-4" />
                        )}
                        Send SMS
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <div className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {results && (
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>Results</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyResults}
                            >
                              {copied ? (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <ClipboardCopy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px]">
                            {results}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>SMS Endpoint</AlertTitle>
                      <AlertDescription className="break-all">
                        <code className="bg-muted px-1 py-0.5 rounded">
                          /api/webhooks/sms?number={`{number}`}&text={`{text}`}&datetime={`{datetime}`}
                        </code>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="query">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Query Historical Data</CardTitle>
                      <CardDescription>
                        Retrieve historical data by phone number and date range
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="queryType">Data Type</Label>
                        <Select value={queryType} onValueChange={setQueryType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sms">SMS Messages</SelectItem>
                            <SelectItem value="voice">Voice Calls</SelectItem>
                            <SelectItem value="all">All Communications</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="queryNumber">Phone Number</Label>
                        <Input
                          id="queryNumber"
                          placeholder="e.g. 123456789"
                          value={queryNumber}
                          onChange={(e) => setQueryNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(startDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && setStartDate(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(endDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => date && setEndDate(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="queryLimit">Limit</Label>
                        <Input
                          id="queryLimit"
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="Maximum records to return"
                          value={queryLimit}
                          onChange={(e) => setQueryLimit(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleQueryData} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlayIcon className="mr-2 h-4 w-4" />
                        )}
                        Query Data
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <div className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {results && (
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>Results</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyResults}
                            >
                              {copied ? (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <ClipboardCopy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px]">
                            {results}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Generic Query Endpoint</AlertTitle>
                      <AlertDescription className="break-all">
                        <code className="bg-muted px-1 py-0.5 rounded">
                          /api/webhooks/generic?provider={`{type}`}&query=historical&number={`{number}`}&start_date={`{start}`}&end_date={`{end}`}&limit={`{limit}`}
                        </code>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="docs">
                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Documentation</CardTitle>
                    <CardDescription>
                      How to integrate with the IPRN Management System webhooks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">About Webhooks</h3>
                      <p className="text-muted-foreground">
                        Webhooks allow external systems to send data to the IPRN Management System.
                        This allows you to integrate your telecom services with our platform for SMS messages,
                        voice calls, and delivery receipts.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Available Endpoints</h3>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">SMS Webhook</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Send SMS messages to the system or query message history by date range.
                        </p>
                        <div className="bg-muted p-3 rounded-md">
                          <code className="text-sm">GET /api/webhooks/sms?number=123456789&text=Hello</code>
                        </div>
                        <div className="bg-muted p-3 rounded-md mt-2">
                          <code className="text-sm">GET /api/webhooks/sms?number=123456789&start_date=2025-05-01&end_date=2025-05-15</code>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Voice Webhook</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Send voice call data to the system or query call history by date range.
                        </p>
                        <div className="bg-muted p-3 rounded-md">
                          <code className="text-sm">GET /api/webhooks/voice?caller_id=123456789&number=987654321&duration=60</code>
                        </div>
                        <div className="bg-muted p-3 rounded-md mt-2">
                          <code className="text-sm">GET /api/webhooks/voice?number=987654321&start_date=2025-05-01&end_date=2025-05-15</code>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Generic Webhook</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Universal webhook that works with multiple provider formats and supports querying all data types.
                        </p>
                        <div className="bg-muted p-3 rounded-md">
                          <code className="text-sm">GET /api/webhooks/generic?provider=twilio&event=incoming_sms&from=123456789&to=987654321&text=Hello</code>
                        </div>
                        <div className="bg-muted p-3 rounded-md mt-2">
                          <code className="text-sm">POST /api/webhooks/generic</code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          POST requests require a JSON body with the appropriate parameters.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Integration Tips</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Use GET requests for simple integrations and testing</li>
                        <li>Use POST requests for more complex data or provider-specific formats</li>
                        <li>Include timestamps in ISO format (YYYY-MM-DDThh:mm:ss.sssZ) or readable date format</li>
                        <li>For date ranges, if not specified, startDate defaults to 1970-01-01 and endDate to current time</li>
                        <li>Add an API key in production for security (via header: X-API-Key or query param: api_key)</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">More Information</h3>
                      <p className="text-sm text-muted-foreground">
                        For more detailed API documentation, visit the <a href="/api-docs" className="text-primary hover:underline">API Documentation</a> page.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}