import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountryData {
  country: string;
  revenue: number;
  percentage?: number;
}

interface CountryPerformanceProps {
  countries?: CountryData[];
  isLoading: boolean;
}

export default function CountryPerformance({ countries, isLoading }: CountryPerformanceProps) {
  // Calculate percentages based on the highest revenue
  const prepareData = () => {
    if (!countries || countries.length === 0) return [];
    
    const maxRevenue = Math.max(...countries.map(c => c.revenue));
    return countries.map(country => ({
      ...country,
      percentage: Math.round((country.revenue / maxRevenue) * 100)
    }));
  };

  const data = prepareData();

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold">Top Performing Countries</h3>
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
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full mr-3" />
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-1.5 w-full mt-1.5" />
                </div>
              </div>
            </li>
          ))
        ) : data.length > 0 ? (
          data.map((country, index) => (
            <li key={index} className="px-5 py-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium">{country.country}</span>
                  <span className="text-success">${country.revenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-5 py-8 text-center text-muted-foreground">
            No country data available
          </li>
        )}
      </ul>
    </Card>
  );
}
