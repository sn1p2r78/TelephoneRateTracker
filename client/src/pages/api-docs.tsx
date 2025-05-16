import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Play } from "lucide-react";
import HeaderNav from "@/components/header-nav";
import SidebarNav from "@/components/sidebar-nav";

// Sample code snippets
const smsWebhookCodeCurl = `curl "https://yourdomain.com/api/webhooks/sms?number=123456789&text=Hello&datetime=2025-05-15%2012:45:00"`;

const smsWebhookCodeNode = `const axios = require('axios');

// Sending a message to the webhook
axios.get('https://yourdomain.com/api/webhooks/sms', {
  params: {
    number: '123456789',
    text: 'Hello',
    datetime: new Date().toISOString()
  }
})
.then(response => {
  console.log('Message sent:', response.data);
})
.catch(error => {
  console.error('Error sending message:', error);
});`;

const smsWebhookCodePython = `import requests
from datetime import datetime

# Sending a message to the webhook
params = {
    'number': '123456789',
    'text': 'Hello',
    'datetime': datetime.now().isoformat()
}

response = requests.get('https://yourdomain.com/api/webhooks/sms', params=params)
print('Message sent:', response.json())`;

const voiceWebhookCodeCurl = `curl -X POST "https://yourdomain.com/api/webhooks/voice/incoming" \\
  -H "Content-Type: application/json" \\
  -d '{"number":"123456789","caller_id":"987654321","timestamp":"2025-05-15T12:45:00.000Z"}'`;

const voiceWebhookGetCodeCurl = `curl "https://yourdomain.com/api/webhooks/voice?caller_id=987654321&number=123456789&duration=60&timestamp=2025-05-15%2012:45:00"`;

const voiceWebhookCodeNode = `const axios = require('axios');

// Sending a call notification to the webhook
axios.post('https://yourdomain.com/api/webhooks/voice/incoming', {
  number: '123456789',
  caller_id: '987654321',
  timestamp: new Date().toISOString()
})
.then(response => {
  console.log('Call notification sent:', response.data);
})
.catch(error => {
  console.error('Error sending call notification:', error);
});`;

const voiceWebhookGetCodeNode = `const axios = require('axios');

// Sending a call notification to the webhook using GET
axios.get('https://yourdomain.com/api/webhooks/voice', {
  params: {
    caller_id: '987654321',
    number: '123456789',
    duration: 60,
    timestamp: new Date().toISOString()
  }
})
.then(response => {
  console.log('Call notification sent:', response.data);
})
.catch(error => {
  console.error('Error sending call notification:', error);
});`;

const voiceWebhookCodePython = `import requests
from datetime import datetime

# Sending a call notification to the webhook
data = {
    'number': '123456789',
    'caller_id': '987654321',
    'timestamp': datetime.now().isoformat()
}

response = requests.post('https://yourdomain.com/api/webhooks/voice/incoming', json=data)
print('Call notification sent:', response.json())`;

const voiceWebhookGetCodePython = `import requests
from datetime import datetime

# Sending a call notification using GET
params = {
    'caller_id': '987654321',
    'number': '123456789',
    'duration': 60,
    'timestamp': datetime.now().isoformat()
}

response = requests.get('https://yourdomain.com/api/webhooks/voice', params=params)
print('Call notification sent:', response.json())`;

const genericWebhookCodeCurl = `curl -X POST "https://yourdomain.com/api/webhooks/generic" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"twilio","event":"incoming_sms","number":"123456789","text":"Hello","timestamp":"2025-05-15T12:45:00.000Z"}'`;

const genericWebhookCodeNode = `const axios = require('axios');

// Using the generic webhook with custom provider data
axios.post('https://yourdomain.com/api/webhooks/generic', {
  provider: 'twilio',
  event: 'incoming_sms',
  number: '123456789',
  text: 'Hello',
  timestamp: new Date().toISOString()
})
.then(response => {
  console.log('Generic webhook request sent:', response.data);
})
.catch(error => {
  console.error('Error sending to generic webhook:', error);
});`;

const genericWebhookCodePython = `import requests
from datetime import datetime

# Using the generic webhook with custom provider data
data = {
    'provider': 'twilio',
    'event': 'incoming_sms',
    'number': '123456789',
    'text': 'Hello',
    'timestamp': datetime.now().isoformat()
}

response = requests.post('https://yourdomain.com/api/webhooks/generic', json=data)
print('Generic webhook request sent:', response.json())`;

export default function ApiDocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="API Documentation" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground">
              Integration guidelines and webhook endpoints for the IPRN management system
            </p>
          </div>

          <Tabs defaultValue="sms">
            <TabsList className="mb-4">
              <TabsTrigger value="sms">SMS Webhooks</TabsTrigger>
              <TabsTrigger value="voice">Voice Webhooks</TabsTrigger>
              <TabsTrigger value="generic">Generic Webhook</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
            </TabsList>

            <TabsContent value="sms">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Webhook API</CardTitle>
                  <CardDescription>
                    Send SMS messages to the system via HTTP webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Endpoint URL</h3>
                      <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                        <code className="text-sm">/api/webhooks/sms</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("/api/webhooks/sms", "smsEndpoint")}
                        >
                          {copiedStates["smsEndpoint"] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Method</h3>
                      <p className="bg-muted p-3 rounded-md text-sm">GET</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Functionality</h3>
                      <p className="text-muted-foreground mb-4">
                        This endpoint supports two modes of operation:
                      </p>
                      
                      <Tabs defaultValue="send" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="send">Send SMS</TabsTrigger>
                          <TabsTrigger value="query">Query Messages</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="send">
                          <h4 className="font-semibold mt-4 mb-2">Send SMS Mode Parameters</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">number</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The phone number sending the SMS</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">text</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The content of the SMS message</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">datetime</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>The timestamp of the message (defaults to current time)</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        
                          <h4 className="font-semibold mt-4 mb-2">Response Example</h4>
                          <pre className="bg-muted p-3 rounded-md text-sm">
                            {JSON.stringify({
                              success: true,
                              message: "Message received",
                              message_id: 123,
                              auto_response: true
                            }, null, 2)}
                          </pre>
                        </TabsContent>
                      
                        <TabsContent value="query">
                          <h4 className="font-semibold mt-4 mb-2">Query Mode Parameters</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">number</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The phone number to query messages for</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">start_date</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>Start date for filtering (ISO format or readable date)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">end_date</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>End date for filtering (ISO format or readable date)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">limit</TableCell>
                                <TableCell>number</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>Maximum number of messages to return (default: 100)</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        
                          <h4 className="font-semibold mt-4 mb-2">Response Example</h4>
                          <pre className="bg-muted p-3 rounded-md text-sm">
                            {JSON.stringify({
                              success: true,
                              count: 2,
                              date_range: {
                                from: "2025-05-01T00:00:00.000Z",
                                to: "2025-05-15T00:00:00.000Z"
                              },
                              messages: [
                                {
                                  id: 1,
                                  phoneNumber: "123456789",
                                  messageText: "Hello world",
                                  timestamp: "2025-05-10T14:30:00.000Z",
                                  isProcessed: true,
                                  responseText: "Auto-response: Thank you for your message",
                                  responseTimestamp: "2025-05-10T14:30:05.000Z"
                                },
                                {
                                  id: 2,
                                  phoneNumber: "123456789",
                                  messageText: "Second message",
                                  timestamp: "2025-05-12T09:15:00.000Z",
                                  isProcessed: true,
                                  responseText: "Auto-response: We received your message",
                                  responseTimestamp: "2025-05-12T09:15:03.000Z"
                                }
                              ]
                            }, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response</h3>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {JSON.stringify({ success: true, message: "Message received" }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                      
                      <Tabs defaultValue="curl" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="node">Node.js</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="curl">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {smsWebhookCodeCurl}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(smsWebhookCodeCurl, "smsCodeCurl")}
                            >
                              {copiedStates["smsCodeCurl"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="node">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {smsWebhookCodeNode}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(smsWebhookCodeNode, "smsCodeNode")}
                            >
                              {copiedStates["smsCodeNode"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {smsWebhookCodePython}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(smsWebhookCodePython, "smsCodePython")}
                            >
                              {copiedStates["smsCodePython"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Webhook API</CardTitle>
                  <CardDescription>
                    Send voice call notifications to the system via HTTP webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Endpoint URL</h3>
                      <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                        <code className="text-sm">/api/webhooks/voice/incoming</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("/api/webhooks/voice/incoming", "voiceEndpoint")}
                        >
                          {copiedStates["voiceEndpoint"] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Method</h3>
                      <p className="bg-muted p-3 rounded-md text-sm">POST</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Functionality</h3>
                      <p className="text-muted-foreground mb-4">
                        This endpoint supports two modes of operation:
                      </p>
                      
                      <Tabs defaultValue="send" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="send">Record Call</TabsTrigger>
                          <TabsTrigger value="query">Query Calls</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="send">
                          <h4 className="font-semibold mt-4 mb-2">Record Call Mode Parameters</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">number</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The phone number receiving the call</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">caller_id</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The caller's phone number</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">duration</TableCell>
                                <TableCell>number</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>Call duration in seconds (if completed)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">timestamp</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>The timestamp of the call (defaults to current time)</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        
                          <h4 className="font-semibold mt-4 mb-2">Response Example</h4>
                          <pre className="bg-muted p-3 rounded-md text-sm">
                            {JSON.stringify({
                              success: true,
                              message: "Call notification received",
                              id: 456
                            }, null, 2)}
                          </pre>
                        </TabsContent>
                      
                        <TabsContent value="query">
                          <h4 className="font-semibold mt-4 mb-2">Query Mode Parameters</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">number</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>Yes</TableCell>
                                <TableCell>The phone number to query calls for (can be caller or recipient)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">start_date</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>Start date for filtering (ISO format or readable date)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">end_date</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>End date for filtering (ISO format or readable date)</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">limit</TableCell>
                                <TableCell>number</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>Maximum number of calls to return (default: 50)</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        
                          <h4 className="font-semibold mt-4 mb-2">Response Example</h4>
                          <pre className="bg-muted p-3 rounded-md text-sm">
                            {JSON.stringify({
                              success: true,
                              count: 2,
                              date_range: {
                                from: "2025-05-01T00:00:00.000Z",
                                to: "2025-05-15T00:00:00.000Z"
                              },
                              calls: [
                                {
                                  id: 1,
                                  caller: "123456789",
                                  recipient: "987654321",
                                  numberValue: "987654321",
                                  startTime: "2025-05-10T14:30:00.000Z",
                                  endTime: "2025-05-10T14:32:15.000Z",
                                  duration: 135,
                                  status: "COMPLETED",
                                  revenue: 2.15
                                },
                                {
                                  id: 2,
                                  caller: "123456789",
                                  recipient: "987654321",
                                  numberValue: "987654321",
                                  startTime: "2025-05-12T09:15:00.000Z",
                                  endTime: "2025-05-12T09:18:42.000Z", 
                                  duration: 222,
                                  status: "COMPLETED",
                                  revenue: 3.42
                                }
                              ]
                            }, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response</h3>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {JSON.stringify({ success: true, message: "Call notification received" }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                      
                      <Tabs defaultValue="post" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="post">POST Method</TabsTrigger>
                          <TabsTrigger value="get">GET Method</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="post">
                          <p className="text-muted-foreground mb-4">Using POST method with JSON body:</p>
                          <Tabs defaultValue="curl" className="mt-4">
                            <TabsList>
                              <TabsTrigger value="curl">cURL</TabsTrigger>
                              <TabsTrigger value="node">Node.js</TabsTrigger>
                              <TabsTrigger value="python">Python</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="curl">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookCodeCurl}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookCodeCurl, "voiceCodeCurl")}
                                >
                                  {copiedStates["voiceCodeCurl"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="node">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookCodeNode}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookCodeNode, "voiceCodeNode")}
                                >
                                  {copiedStates["voiceCodeNode"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="python">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookCodePython}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookCodePython, "voiceCodePython")}
                                >
                                  {copiedStates["voiceCodePython"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </TabsContent>
                        
                        <TabsContent value="get">
                          <p className="text-muted-foreground mb-4">Using GET method with URL parameters (simpler integration):</p>
                          <div className="bg-muted p-3 rounded-md mb-4 text-sm">
                            <code className="text-sm font-medium">Endpoint URL: /api/webhooks/voice</code>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Parameters</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Parameter</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Required</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">caller_id</TableCell>
                                  <TableCell>string</TableCell>
                                  <TableCell>Yes</TableCell>
                                  <TableCell>The caller's phone number</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">number</TableCell>
                                  <TableCell>string</TableCell>
                                  <TableCell>Yes</TableCell>
                                  <TableCell>The phone number receiving the call</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">duration</TableCell>
                                  <TableCell>integer</TableCell>
                                  <TableCell>No</TableCell>
                                  <TableCell>Call duration in seconds (if completed)</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">timestamp</TableCell>
                                  <TableCell>string (datetime)</TableCell>
                                  <TableCell>No</TableCell>
                                  <TableCell>The timestamp of the call (defaults to current time)</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                          
                          <Tabs defaultValue="curl" className="mt-4">
                            <TabsList>
                              <TabsTrigger value="curl">cURL</TabsTrigger>
                              <TabsTrigger value="node">Node.js</TabsTrigger>
                              <TabsTrigger value="python">Python</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="curl">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookGetCodeCurl}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookGetCodeCurl, "voiceGetCodeCurl")}
                                >
                                  {copiedStates["voiceGetCodeCurl"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="node">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookGetCodeNode}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookGetCodeNode, "voiceGetCodeNode")}
                                >
                                  {copiedStates["voiceGetCodeNode"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="python">
                              <div className="relative">
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                  {voiceWebhookGetCodePython}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(voiceWebhookGetCodePython, "voiceGetCodePython")}
                                >
                                  {copiedStates["voiceGetCodePython"] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generic">
              <Card>
                <CardHeader>
                  <CardTitle>Generic Webhook API</CardTitle>
                  <CardDescription>
                    Universal webhook for different provider integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Endpoint URL</h3>
                      <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                        <code className="text-sm">/api/webhooks/generic</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("/api/webhooks/generic", "genericEndpoint")}
                        >
                          {copiedStates["genericEndpoint"] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Method</h3>
                      <p className="bg-muted p-3 rounded-md text-sm">POST</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Request Body</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parameter</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">provider</TableCell>
                            <TableCell>string</TableCell>
                            <TableCell>Yes</TableCell>
                            <TableCell>The provider name (e.g., twilio, infobip)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">event</TableCell>
                            <TableCell>string</TableCell>
                            <TableCell>Yes</TableCell>
                            <TableCell>Event type (incoming_call, incoming_sms, call_status, dlr_status)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">[Additional fields]</TableCell>
                            <TableCell>various</TableCell>
                            <TableCell>Yes</TableCell>
                            <TableCell>Depends on the event type</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response</h3>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {JSON.stringify({ success: true, message: "Webhook processed" }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                      
                      <Tabs defaultValue="curl" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="node">Node.js</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="curl">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {genericWebhookCodeCurl}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(genericWebhookCodeCurl, "genericCodeCurl")}
                            >
                              {copiedStates["genericCodeCurl"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="node">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {genericWebhookCodeNode}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(genericWebhookCodeNode, "genericCodeNode")}
                            >
                              {copiedStates["genericCodeNode"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python">
                          <div className="relative">
                            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                              {genericWebhookCodePython}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(genericWebhookCodePython, "genericCodePython")}
                            >
                              {copiedStates["genericCodePython"] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication API</CardTitle>
                  <CardDescription>
                    How to authenticate with the IPRN Management API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-amber-100 text-amber-800 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Authentication Required</h3>
                      <p>
                        Most API endpoints for the IPRN Management System require authentication. Public webhook endpoints 
                        do not require authentication to allow easier integration with third-party services.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Login</h3>
                      <p className="text-muted-foreground mb-4">
                        Use the login endpoint to get a session token that can be used for subsequent API calls.
                      </p>

                      <div className="bg-muted p-3 rounded-md mb-2">
                        <p className="font-medium mb-1">Endpoint: <code>/api/login</code></p>
                        <p className="font-medium mb-1">Method: POST</p>
                      </div>

                      <h4 className="font-medium mt-4 mb-2">Request Body:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {JSON.stringify({
                          username: "your_username",
                          password: "your_password"
                        }, null, 2)}
                      </pre>

                      <h4 className="font-medium mt-4 mb-2">Response:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {JSON.stringify({
                          id: 1,
                          username: "admin",
                          fullName: "System Admin",
                          role: "admin",
                          // Other user fields...
                        }, null, 2)}
                      </pre>

                      <p className="text-muted-foreground mt-4">
                        The server will set a session cookie that should be included in all subsequent requests.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Session Authentication</h3>
                      <p className="text-muted-foreground mb-4">
                        After logging in, your session cookie will be used to authenticate requests.
                        Include the cookie in all API requests that require authentication.
                      </p>

                      <h4 className="font-medium mt-4 mb-2">Testing your authentication:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm">
                        {`curl -X GET "https://yourdomain.com/api/user" --cookie "connect.sid=your_session_cookie"`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Logout</h3>
                      <div className="bg-muted p-3 rounded-md mb-2">
                        <p className="font-medium mb-1">Endpoint: <code>/api/logout</code></p>
                        <p className="font-medium mb-1">Method: POST</p>
                      </div>

                      <p className="text-muted-foreground">
                        This will invalidate your current session. No request body is required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}