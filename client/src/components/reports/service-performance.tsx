import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  BarChart2, 
  PhoneCall, 
  MessageSquare, 
  Sparkles 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
  isLoading?: boolean;
}

export default function ServicePerformance({ 
  services = [], 
  isLoading = false 
}: ServicePerformanceProps) {
  
  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'voice':
        return <PhoneCall className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'combined':
        return <Sparkles className="h-4 w-4 text-violet-500" />;
      default:
        return <BarChart2 className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Service Performance</CardTitle>
          <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded-full">
            <BarChart2 className="h-4 w-4 text-violet-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : services.length > 0 ? (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted p-1 rounded-md">
                          {getServiceIcon(service.type)}
                        </div>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{service.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(service.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {service.performance === 'up' ? (
                          <span className="text-emerald-500 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {service.change}%
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            {Math.abs(service.change)}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(service.usage)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Total Revenue</div>
                <div className="text-sm font-bold">
                  {formatCurrency(services.reduce((acc, service) => acc + service.revenue, 0))}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {services.some(s => s.performance === 'up') ? (
                  <span className="text-emerald-500 font-medium">↑ 7.2% increase</span>
                ) : (
                  <span className="text-red-500 font-medium">↓ 1.3% decrease</span>
                )} from previous period
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No service data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}