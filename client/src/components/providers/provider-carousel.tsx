import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Provider } from '@shared/schema';
import { ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, Globe, Phone, Mail, Pin } from 'lucide-react';

interface ProviderCarouselProps {
  providers: Provider[];
  onConnect: (provider: Provider) => void;
}

export default function ProviderCarousel({ providers, onConnect }: ProviderCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState<'slide-left' | 'slide-right' | null>(null);

  // Reset animation after it completes
  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => {
        setAnimation(null);
      }, 500); // Match this with CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [animation]);

  const goToPrevious = () => {
    setAnimation('slide-right');
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? providers.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setAnimation('slide-left');
    setCurrentIndex((prevIndex) => 
      prevIndex === providers.length - 1 ? 0 : prevIndex + 1
    );
  };

  const serviceTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'premium numbers':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'sms & voice apis':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'mobile payments':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'premium sms':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'premium apis':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (!providers || providers.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">No providers available</p>
        </CardContent>
      </Card>
    );
  }

  const provider = providers[currentIndex];

  return (
    <div className="relative w-full">
      <Card className={`w-full overflow-hidden shadow-md ${animation ? animation : ''}`}
        style={{ 
          transition: 'transform 0.5s ease-in-out', 
        }}
      >
        <CardHeader className="relative pb-0">
          <div className="absolute top-4 right-4 flex space-x-2">
            <Badge className={serviceTypeColor(provider.serviceType)}>
              {provider.serviceType}
            </Badge>
            {provider.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                Inactive
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{provider.name}</CardTitle>
          <CardDescription className="mt-1">
            {(provider as any).description || provider.notes || 'Premium number services provider'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">Provider Details</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {provider.website ? (
                      <a 
                        href={provider.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                      >
                        Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No website available</span>
                    )}
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{provider.contactEmail || 'No contact email'}</span>
                </li>
                <li className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{provider.contactPhone || 'No contact phone'}</span>
                </li>
                <li className="flex items-start text-sm">
                  <Pin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>{(provider as any).location || 'Location not specified'}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Service Pricing</h4>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{provider.pricingDetails || 'Contact provider for pricing details'}</p>
              </div>
              <h4 className="text-sm font-semibold mt-4 mb-2">Available Countries</h4>
              <div className="flex flex-wrap gap-2">
                {provider.supportedCountries ? (
                  provider.supportedCountries.split(',').map((country, i) => (
                    <Badge key={i} variant="outline" className="bg-background">
                      {country.trim()}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Contact provider for coverage details</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Provider ID: {provider.id}
          </div>
          <Button onClick={() => onConnect(provider)}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </CardFooter>
      </Card>
      
      {providers.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background shadow-md hover:bg-primary hover:text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background shadow-md hover:bg-primary hover:text-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
            {providers.map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => {
                  setAnimation(i < currentIndex ? 'slide-right' : 'slide-left');
                  setCurrentIndex(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}