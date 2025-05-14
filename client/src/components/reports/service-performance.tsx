import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceData {
  name: string;
  type: string;
  revenue: number;
  performance: string;
  change: number;
  usage: number;
}

interface ServicePerformanceProps {
  services?: ServiceData[];
  isLoading: boolean;
}

export default function ServicePerformance({ services, isLoading }: ServicePerformanceProps) {
  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'High Performance':
        return <Badge variant="outline" className="bg-success/10 text-success">{performance}</Badge>;
      case 'Medium Performance':
        return <Badge variant="outline" className="bg-accent/10 text-accent">{performance}</Badge>;
      case 'Low Performance':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">{performance}</Badge>;
      default:
        return <Badge variant="outline">{performance}</Badge>;
    }
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold">Service Performance</h3>
        <Button variant="ghost" size="icon">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {isLoading ? (
          Array(5).fill(0).map((_, index) => (
            <li key={index} className="px-5 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="flex items-center mt-2">
                <Skeleton className="h-4 w-24 mr-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </li>
          ))
        ) : services && services.length > 0 ? (
          services.map((service, index) => (
            <li key={index} className="px-5 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {service.type === 'voice' ? 'Premium voice service' : 'SMS service'}
                  </p>
                </div>
                {getPerformanceBadge(service.performance)}
              </div>
              <div className="flex items-center mt-2">
                <div className="text-sm text-foreground mr-4">
                  <span className="font-medium">${service.revenue.toFixed(2)}</span>
                  <span className={`text-xs ml-1 ${
                    service.change > 0 ? 'text-success' : 
                    service.change < 0 ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {service.change > 0 ? '+' : ''}{service.change}%
                  </span>
                </div>
                <div className="text-sm text-foreground">
                  <span className="font-medium">
                    {service.usage.toLocaleString()} {service.type === 'voice' ? 'mins' : 'msgs'}
                  </span>
                  <span className={`text-xs ml-1 ${
                    service.change > 0 ? 'text-success' : 
                    service.change < 0 ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {service.change > 0 ? '+' : ''}{Math.round(service.change * 0.8)}%
                  </span>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-5 py-8 text-center text-muted-foreground">
            No service data available
          </li>
        )}
      </ul>
    </Card>
  );
}
