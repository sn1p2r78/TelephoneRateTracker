import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  PlusIcon, 
  Pencil1Icon, 
  Cross2Icon,
  ReloadIcon,
  CheckIcon
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Define form schema for auto-responder
const autoResponderFormSchema = z.object({
  numberId: z.number({
    required_error: "Number is required",
  }),
  name: z.string().min(1, "Name is required"),
  triggerType: z.enum(["any", "keyword", "regex"], {
    required_error: "Trigger type is required",
  }),
  triggerValue: z.string().optional(),
  responseMessage: z.string().min(1, "Response message is required"),
  isActive: z.boolean().default(true),
  matchCase: z.boolean().default(false),
  priority: z.number().default(0),
});

type AutoResponderForm = z.infer<typeof autoResponderFormSchema>;

interface Number {
  id: number;
  name: string;
  number: string;
}

interface AutoResponder {
  id: number;
  numberId: number;
  name: string;
  triggerType: "any" | "keyword" | "regex";
  triggerValue: string | null;
  responseMessage: string;
  isActive: boolean;
  matchCase: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string | null;
}

export default function AutoRespondersPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testNumberId, setTestNumberId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: autoResponders, isLoading } = useQuery<AutoResponder[]>({
    queryKey: ["/api/auto-responders"],
    queryFn: async () => {
      const res = await fetch("/api/auto-responders");
      if (!res.ok) throw new Error("Failed to fetch auto-responders");
      return res.json();
    }
  });
  
  const { data: numbers } = useQuery<Number[]>({
    queryKey: ["/api/numbers"],
    queryFn: async () => {
      const res = await fetch("/api/numbers");
      if (!res.ok) throw new Error("Failed to fetch numbers");
      return res.json();
    }
  });
  
  const form = useForm<AutoResponderForm>({
    resolver: zodResolver(autoResponderFormSchema),
    defaultValues: {
      numberId: undefined,
      name: "",
      triggerType: "any",
      triggerValue: "",
      responseMessage: "",
      isActive: true,
      matchCase: false,
      priority: 0,
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: AutoResponderForm) => {
      const res = await apiRequest("POST", "/api/auto-responders", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create auto-responder");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-responders"] });
      toast({
        title: "Auto-responder created",
        description: "Your auto-responder has been created successfully.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create auto-responder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AutoResponderForm }) => {
      const res = await apiRequest("PUT", `/api/auto-responders/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update auto-responder");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-responders"] });
      toast({
        title: "Auto-responder updated",
        description: "Your auto-responder has been updated successfully.",
      });
      setEditingId(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update auto-responder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/auto-responders/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete auto-responder");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-responders"] });
      toast({
        title: "Auto-responder deleted",
        description: "The auto-responder has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete auto-responder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: AutoResponderForm) => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleEdit = (autoResponder: AutoResponder) => {
    setEditingId(autoResponder.id);
    form.reset({
      numberId: autoResponder.numberId,
      name: autoResponder.name,
      triggerType: autoResponder.triggerType,
      triggerValue: autoResponder.triggerValue || "",
      responseMessage: autoResponder.responseMessage,
      isActive: autoResponder.isActive,
      matchCase: autoResponder.matchCase,
      priority: autoResponder.priority,
    });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this auto-responder?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleTestResponder = async () => {
    if (!testNumberId || !testMessage) {
      toast({
        title: "Test failed",
        description: "Please select a number and enter a test message.",
        variant: "destructive",
      });
      return;
    }
    
    setTestLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auto-responders/test", {
        numberId: testNumberId,
        message: testMessage,
      });
      
      if (!res.ok) {
        throw new Error("Test failed");
      }
      
      const result = await res.json();
      setTestResult(result);
      
      toast({
        title: result.matchCount > 0 ? "Match found!" : "No matches",
        description: result.matchCount > 0 
          ? `Found ${result.matchCount} matching auto-responder(s)` 
          : "No auto-responders matched your test message",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Failed to test auto-responder",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const getNumberName = (id: number) => {
    if (!numbers) return "Unknown";
    const found = numbers.find(n => n.id === id);
    return found ? `${found.name} (${found.number})` : "Unknown";
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SMS Auto-Responders</h1>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Auto-Responders List</TabsTrigger>
          <TabsTrigger value="create">{editingId ? "Edit" : "Create"} Auto-Responder</TabsTrigger>
          <TabsTrigger value="test">Test Auto-Responders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Configured Auto-Responders</CardTitle>
              <CardDescription>
                Manage your automated responses to incoming SMS messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <ReloadIcon className="w-6 h-6 animate-spin" />
                </div>
              ) : !autoResponders?.length ? (
                <p className="text-center text-muted-foreground py-4">
                  No auto-responders configured yet. Create one to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Trigger Type</TableHead>
                        <TableHead>Trigger Value</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {autoResponders.map((responder) => (
                        <TableRow key={responder.id}>
                          <TableCell>{getNumberName(responder.numberId)}</TableCell>
                          <TableCell>{responder.name}</TableCell>
                          <TableCell>
                            <Badge>
                              {responder.triggerType === "any" ? "Any Message" :
                               responder.triggerType === "keyword" ? "Keyword" : "Regex"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {responder.triggerType === "any" ? "-" : 
                             responder.triggerValue || "Not specified"}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {responder.responseMessage}
                          </TableCell>
                          <TableCell>{responder.priority}</TableCell>
                          <TableCell>
                            <Badge variant={responder.isActive ? "success" : "destructive"}>
                              {responder.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(responder)}
                              >
                                <Pencil1Icon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(responder.id)}
                              >
                                <Cross2Icon className="h-4 w-4" />
                              </Button>
                            </div>
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
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit" : "Create"} Auto-Responder</CardTitle>
              <CardDescription>
                Configure automated responses to incoming SMS messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IPRN Number</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a number" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {numbers?.map((number) => (
                                <SelectItem key={number.id} value={number.id.toString()}>
                                  {number.name} ({number.number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome Message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="triggerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trigger type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any Message</SelectItem>
                              <SelectItem value="keyword">Keyword</SelectItem>
                              <SelectItem value="regex">Regex Pattern</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("triggerType") !== "any" && (
                      <FormField
                        control={form.control}
                        name="triggerValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {form.watch("triggerType") === "keyword" ? "Keyword" : "Regex Pattern"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={
                                  form.watch("triggerType") === "keyword" 
                                    ? "help, info, start" 
                                    : "\\b(help|info)\\b"
                                } 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="responseMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Thank you for your message. This is an automated response."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="ml-2">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("triggerType") !== "any" && (
                      <FormField
                        control={form.control}
                        name="matchCase"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="ml-2">Match Case</FormLabel>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {editingId !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingId !== null ? "Update" : "Create"} Auto-Responder
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Auto-Responders</CardTitle>
              <CardDescription>
                Test how your auto-responders will react to incoming messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>IPRN Number</FormLabel>
                    <Select
                      onValueChange={(value) => setTestNumberId(parseInt(value))}
                      value={testNumberId?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a number" />
                      </SelectTrigger>
                      <SelectContent>
                        {numbers?.map((number) => (
                          <SelectItem key={number.id} value={number.id.toString()}>
                            {number.name} ({number.number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Test Message</FormLabel>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Enter a message to test" 
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                      />
                      <Button onClick={handleTestResponder} disabled={testLoading}>
                        {testLoading ? <ReloadIcon className="h-4 w-4 animate-spin" /> : "Test"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {testResult && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span>{getNumberName(testResult.numberId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Message:</span>
                        <span>"{testResult.message}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Matches:</span>
                        <span>{testResult.matchCount}</span>
                      </div>
                      <Separator />
                      
                      {testResult.matchCount > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-medium">Response:</h4>
                          <div className="p-3 bg-muted rounded-md">
                            {testResult.response}
                          </div>
                          
                          <h4 className="font-medium">Matching Auto-Responders:</h4>
                          <div className="space-y-2">
                            {testResult.matches.map((match: any) => (
                              <div key={match.id} className="p-3 border rounded-md">
                                <div className="flex justify-between">
                                  <span className="font-medium">{match.name}</span>
                                  <Badge variant="outline">
                                    Priority: {match.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {match.triggerType === "any" ? "Responds to any message" : 
                                   `Trigger: ${match.triggerType} "${match.triggerValue}"`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-muted-foreground">No matching auto-responders found</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}