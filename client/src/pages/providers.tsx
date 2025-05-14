import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Provider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ProviderCarousel from "@/components/providers/provider-carousel";
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
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Loader2, ExternalLink, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProvidersPage() {
  const { toast } = useToast();
  
  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ["/api/providers"]
  });
  
  // Handle error separately
  if (error) {
    toast({
      title: "Error loading providers",
      description: (error as Error).message,
      variant: "destructive",
    });
  }

  const serviceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium numbers':
        return 'bg-amber-100 text-amber-800';
      case 'sms & voice apis':
        return 'bg-blue-100 text-blue-800';
      case 'mobile payments':
        return 'bg-green-100 text-green-800';
      case 'premium sms':
        return 'bg-purple-100 text-purple-800';
      case 'premium apis':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  
  const handleConnect = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowConnectDialog(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Premium Rate Number Providers</h1>
        <p className="text-muted-foreground mt-2">
          Manage premium rate number providers and their service offerings
        </p>
      </div>
      
      {/* Provider Carousel */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Providers</h2>
            <p className="text-muted-foreground">
              Browse and connect with premium rate number service providers
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
        
        {isLoading ? (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : providers && providers.length > 0 ? (
          <div className="w-full mb-8">
            <ProviderCarousel providers={providers} onConnect={handleConnect} />
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                No providers found. Add your first provider to get started.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Provider Table */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Premium Rate Number Providers</CardTitle>
            <CardDescription>
              Partner with these providers to access premium rate numbers and SMS services
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers && providers.length > 0 ? (
            <Table>
              <TableCaption>List of premium rate number service providers</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider: any) => (
                  <TableRow key={provider.id} className="group">
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${serviceTypeColor(provider.serviceType)}`}>
                        {provider.serviceType}
                      </span>
                    </TableCell>
                    <TableCell>{provider.pricingDetails}</TableCell>
                    <TableCell>
                      {provider.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.website && (
                        <a 
                          href={provider.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnect(provider)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Connect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No providers found. Add your first provider to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Provider Connection Dialog */}
      {selectedProvider && (
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Connect to {selectedProvider.name}</DialogTitle>
              <DialogDescription>
                Enter your provider credentials to establish a connection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="integrationType" className="text-right">Integration Type</Label>
                <Select defaultValue="http">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select integration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="smpp">SMPP</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apiKey" className="text-right">API Key</Label>
                <Input id="apiKey" placeholder="Enter API key" className="col-span-3" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="baseUrl" className="text-right">Base URL</Label>
                <Input id="baseUrl" placeholder="https://api.provider.com" className="col-span-3" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endpoint" className="text-right">Endpoint</Label>
                <Input id="endpoint" placeholder="/v1/messages" className="col-span-3" />
              </div>
              
              <div className="col-span-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="additional-settings">
                    <AccordionTrigger>Advanced Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">Username</Label>
                          <Input id="username" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">Password</Label>
                          <Input id="password" type="password" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="port" className="text-right">Port</Label>
                          <Input id="port" type="number" className="col-span-3" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>Cancel</Button>
              <Button>Connect Provider</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Integration Process</CardTitle>
            <CardDescription>Steps to integrate with a new provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal pl-5">
              <li>
                <strong>Select a provider</strong> based on your needs for premium rate numbers or SMS services
              </li>
              <li>
                <strong>Contact provider</strong> to establish a business relationship and contract
              </li>
              <li>
                <strong>Obtain API credentials</strong> and configuration details from the provider
              </li>
              <li>
                <strong>Configure integration</strong> in the API Integrations section with the provided details
              </li>
              <li>
                <strong>Test the connection</strong> to ensure successful integration
              </li>
              <li>
                <strong>Deploy services</strong> and start monetizing your premium numbers
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Premium Rate Services</CardTitle>
            <CardDescription>Why choose premium rate numbers for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                <div>
                  <strong>High revenue potential</strong> with premium-rate charging models
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                <div>
                  <strong>Global reach</strong> with international number availability
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                <div>
                  <strong>Versatile applications</strong> from customer support to entertainment services
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                <div>
                  <strong>Detailed analytics</strong> for call and message tracking
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                <div>
                  <strong>Easy integration</strong> with existing business systems
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}