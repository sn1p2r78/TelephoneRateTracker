import React, { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Trash2, KeyIcon, Copy, Check, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApiKeysPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["webhooks"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [keyToTest, setKeyToTest] = useState<string>("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testingKey, setTestingKey] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Query to fetch API keys
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ["/api/api-keys"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/api-keys");
      return await response.json();
    },
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { name: string; permissions: string[] }) => {
      const response = await apiRequest("POST", "/api/api-keys", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setGeneratedKey(data.key);
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test API key mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/api-keys/test", { key });
      return await response.json();
    },
    onSuccess: (data) => {
      setTestResult(data);
      setTestingKey(false);
      toast({
        title: data.valid ? "API Key Valid" : "API Key Invalid",
        description: data.valid 
          ? `This key has the following permissions: ${data.permissions.join(", ")}` 
          : "The provided API key is not valid",
        variant: data.valid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      setTestingKey(false);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("DELETE", `/api/api-keys/${key}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your API key.",
        variant: "destructive",
      });
      return;
    }

    createApiKeyMutation.mutate({
      name: newKeyName.trim(),
      permissions: newKeyPermissions,
    });
  };

  const handleDeleteKey = (key: string) => {
    setKeyToDelete(key);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteKey = () => {
    if (keyToDelete) {
      deleteApiKeyMutation.mutate(keyToDelete);
    }
  };
  
  const handleTestKey = () => {
    if (!keyToTest.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to test.",
        variant: "destructive",
      });
      return;
    }
    
    setTestingKey(true);
    testApiKeyMutation.mutate(keyToTest.trim());
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset dialog state when closed
  const handleCreateDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setNewKeyName("");
      setNewKeyPermissions(["webhooks"]);
      setGeneratedKey(null);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setKeyToDelete(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="API Keys" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">API Keys</h1>
                <p className="text-muted-foreground mt-1">
                  Manage API keys for secure external integration with your IPRN system
                </p>
              </div>

              <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {generatedKey ? "Save Your API Key" : "Create API Key"}
                    </DialogTitle>
                    <DialogDescription>
                      {generatedKey
                        ? "This key will only be shown once. Please store it securely."
                        : "Create a new API key for external service integration."}
                    </DialogDescription>
                  </DialogHeader>

                  {generatedKey ? (
                    <div className="space-y-4">
                      <Alert className="border-amber-500 bg-amber-50">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <AlertTitle>Important Security Notice</AlertTitle>
                        <AlertDescription>
                          This API key will only be displayed once and cannot be recovered.
                          Please save it somewhere secure.
                        </AlertDescription>
                      </Alert>

                      <div className="flex items-center space-x-2">
                        <Input
                          readOnly
                          value={generatedKey}
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyKey}
                          className="flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Key Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Twilio Integration"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>Key Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="webhooks"
                              checked={newKeyPermissions.includes("webhooks")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewKeyPermissions([...newKeyPermissions, "webhooks"]);
                                } else {
                                  setNewKeyPermissions(
                                    newKeyPermissions.filter((p) => p !== "webhooks")
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor="webhooks"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Webhooks (Calls, SMS)
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="analytics"
                              checked={newKeyPermissions.includes("analytics")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewKeyPermissions([...newKeyPermissions, "analytics"]);
                                } else {
                                  setNewKeyPermissions(
                                    newKeyPermissions.filter((p) => p !== "analytics")
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor="analytics"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Analytics
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="numbers"
                              checked={newKeyPermissions.includes("numbers")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewKeyPermissions([...newKeyPermissions, "numbers"]);
                                } else {
                                  setNewKeyPermissions(
                                    newKeyPermissions.filter((p) => p !== "numbers")
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor="numbers"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Number Management
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="sm:justify-between">
                    {generatedKey ? (
                      <Button variant="default" onClick={() => setCreateDialogOpen(false)}>
                        Done
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          onClick={handleCreateKey}
                          disabled={createApiKeyMutation.isPending}
                        >
                          {createApiKeyMutation.isPending ? "Creating..." : "Create Key"}
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete API Key</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this API key? This action cannot be
                      undone, and any services using this key will stop working.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="sm:justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteKey}
                      disabled={deleteApiKeyMutation.isPending}
                    >
                      {deleteApiKeyMutation.isPending ? "Deleting..." : "Delete Key"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Test API Key</CardTitle>
                  <CardDescription>
                    Verify an API key is valid and see what permissions it has
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="testKey" className="mb-2 block">API Key</Label>
                      <Input
                        id="testKey"
                        placeholder="Enter API key to test"
                        value={keyToTest}
                        onChange={(e) => setKeyToTest(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleTestKey}
                      disabled={testingKey || !keyToTest.trim()}
                    >
                      {testingKey ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          Testing...
                        </>
                      ) : (
                        "Test Key"
                      )}
                    </Button>
                  </div>
                  
                  {testResult && (
                    <div className={`mt-4 p-4 rounded-md ${
                      testResult.valid 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-red-50 border border-red-200"
                    }`}>
                      <div className="flex items-start">
                        {testResult.valid ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-medium">{testResult.valid ? "Valid API Key" : "Invalid API Key"}</h3>
                          {testResult.valid && (
                            <div className="mt-1 text-sm">
                              <p><span className="font-medium">Name:</span> {testResult.name}</p>
                              <p><span className="font-medium">Permissions:</span> {testResult.permissions.join(", ")}</p>
                              <p><span className="font-medium">Created:</span> {new Date(testResult.created).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>
                    API keys allow secure access to your IPRN system from external services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-6 flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to load API keys. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : apiKeys?.length === 0 ? (
                    <div className="py-6 text-center">
                      <KeyIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">
                        No API keys found. Create one to integrate external services.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Key ID (Prefix)</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys?.map((key: any) => (
                          <TableRow key={key.key}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell>
                              {key.permissions.map((perm: string) => (
                                <span
                                  key={perm}
                                  className="inline-block mr-1 px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                                >
                                  {perm}
                                </span>
                              ))}
                            </TableCell>
                            <TableCell>
                              {key.created
                                ? formatDistanceToNow(new Date(key.created), {
                                    addSuffix: true,
                                  })
                                : "Unknown"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {key.key.substring(0, 10)}...
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteKey(key.key)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 pb-2">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      API keys should be kept secure and never checked into source control. 
                      If a key is compromised, delete it immediately and create a new one.
                    </p>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Best Practices</CardTitle>
                  <CardDescription>
                    Guidelines for using API keys securely in your integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Using API Keys</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Store API keys securely with encryption</li>
                      <li>Use environment variables instead of hardcoding keys</li>
                      <li>Avoid exposing keys in client-side code</li>
                      <li>Rotate keys periodically for better security</li>
                      <li>Use the minimum permissions necessary for each integration</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Authentication Methods</h3>
                    <p className="text-sm text-muted-foreground">
                      API keys can be included in your requests using the following methods:
                    </p>
                    <div className="space-y-2 mt-2">
                      <div className="bg-muted p-2 rounded">
                        <p className="font-mono text-sm">Header: X-API-Key: your_api_key</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="font-mono text-sm">Query parameter: ?api_key=your_api_key</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="font-mono text-sm">JSON body: {"{ \"apiKey\": \"your_api_key\" }"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}