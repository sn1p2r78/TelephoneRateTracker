import { useQuery } from "@tanstack/react-query";
import { Provider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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
  CardTitle 
} from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Premium Rate Number Providers</h1>
        <p className="text-muted-foreground mt-2">
          Manage premium rate number providers and their service offerings
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Premium Rate Number Providers</CardTitle>
          <CardDescription>
            Partner with these providers to access premium rate numbers and SMS services
          </CardDescription>
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
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
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
                      <Button variant="outline" size="sm">
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