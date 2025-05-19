import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample list of countries
const COUNTRIES = [
  { value: "US", label: "United States (+1)" },
  { value: "UK", label: "United Kingdom (+44)" },
  { value: "DE", label: "Germany (+49)" },
  { value: "FR", label: "France (+33)" },
  { value: "IT", label: "Italy (+39)" },
  { value: "ES", label: "Spain (+34)" },
  { value: "CA", label: "Canada (+1)" },
  { value: "AU", label: "Australia (+61)" },
  { value: "JP", label: "Japan (+81)" },
  { value: "BR", label: "Brazil (+55)" },
  { value: "RU", label: "Russia (+7)" },
  { value: "IN", label: "India (+91)" },
  { value: "CN", label: "China (+86)" },
  { value: "MX", label: "Mexico (+52)" },
  { value: "ZA", label: "South Africa (+27)" },
];

// Sample service types
const SERVICE_TYPES = [
  { value: "SUPPORT", label: "Customer Support" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "DATING", label: "Dating Services" },
  { value: "PSYCHIC", label: "Psychic Reading" },
  { value: "ADULT", label: "Adult Services" },
  { value: "CHAT", label: "Chat Services" },
  { value: "VOTING", label: "TV Voting" },
  { value: "FUNDRAISING", label: "Fundraising" },
  { value: "TECHNICAL", label: "Technical Support" },
  { value: "GAMING", label: "Gaming & Contests" },
];

export default function NumberRequestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Request form state
  const [formData, setFormData] = useState({
    country: "",
    serviceType: "",
    quantity: 1,
    notes: ""
  });

  // Success state
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);

  // Create number request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/numbers/request", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setRequestSuccess(true);
      setRequestId(data.request?.id || null);
      queryClient.invalidateQueries({ queryKey: ["/api/numbers/my-requests"] });
      toast({
        title: "Request Submitted",
        description: "Your number request has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.country) {
      toast({
        title: "Country Required",
        description: "Please select a country for your numbers.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.serviceType) {
      toast({
        title: "Service Type Required",
        description: "Please select a service type for your numbers.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    // Submit request
    createRequestMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({
      country: "",
      serviceType: "",
      quantity: 1,
      notes: ""
    });
    setRequestSuccess(false);
    setRequestId(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="Request Numbers" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Request Premium Rate Numbers</h1>
              <p className="text-muted-foreground mt-1">
                Request new premium rate numbers for your services
              </p>
            </div>

            {requestSuccess ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <CardTitle>Request Submitted Successfully</CardTitle>
                  </div>
                  <CardDescription>
                    Your request has been received and is being processed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Request ID: {requestId}</AlertTitle>
                    <AlertDescription>
                      You can track the status of your request in the dashboard.
                      Our team will review your request and get back to you shortly.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Request Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Country:</span> {COUNTRIES.find(c => c.value === formData.country)?.label || formData.country}
                      </p>
                      <p>
                        <span className="font-medium">Service Type:</span> {SERVICE_TYPES.find(t => t.value === formData.serviceType)?.label || formData.serviceType}
                      </p>
                      <p>
                        <span className="font-medium">Quantity:</span> {formData.quantity}
                      </p>
                      {formData.notes && (
                        <p>
                          <span className="font-medium">Notes:</span> {formData.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Need more numbers? You can submit another request.
                    </p>
                    <Button onClick={handleReset}>Request More Numbers</Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline" asChild>
                    <a href="/user-dashboard">Go to Dashboard</a>
                  </Button>
                  <Button asChild>
                    <a href="/number-requests">View My Requests</a>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Number Request Form</CardTitle>
                  <CardDescription>
                    Fill out the form below to request premium rate numbers for your services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-2" />
                              {country.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange("serviceType", value)}
                    >
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              {type.value.includes("CHAT") || type.value.includes("DATING") ? (
                                <MessageSquare className="w-4 h-4 mr-2" />
                              ) : (
                                <PhoneCall className="w-4 h-4 mr-2" />
                              )}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of premium rate numbers you need (maximum 100 per request)
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or preferences for your numbers..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 border-t pt-6">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs text-muted-foreground mb-1">
                      By submitting this request, you agree to the terms and conditions for premium rate number usage.
                    </p>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 sm:flex-none"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={createRequestMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {createRequestMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* Information cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Premium Rate Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Premium Rate Numbers are special telephone numbers that charge higher than normal rates when called or texted. When users call or text these numbers, they are billed at premium rates set by the telecom carriers, with a portion of the revenue shared with you.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Most number requests are processed within 1-3 business days. Once approved, the numbers will be activated and appear in your dashboard. You'll receive a notification when your numbers are ready for use.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}