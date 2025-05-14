import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

interface CountryData {
  country: string;
  revenue: number;
}

interface CountryPerformanceProps {
  countries?: CountryData[];
  isLoading?: boolean;
}

export default function CountryPerformance({ 
  countries = [], 
  isLoading = false 
}: CountryPerformanceProps) {
  
  // Sort countries by revenue (highest first)
  const sortedCountries = [...countries].sort((a, b) => b.revenue - a.revenue);
  
  // Get max revenue for calculating percentages
  const maxRevenue = sortedCountries.length > 0 
    ? sortedCountries[0].revenue 
    : 0;
  
  // Country flag emojis
  const countryFlags: Record<string, string> = {
    'UK': '🇬🇧',
    'US': '🇺🇸',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Performing Countries</CardTitle>
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCountries.length > 0 ? (
          <div className="space-y-4">
            {sortedCountries.map((country, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img" aria-label={country.country}>
                      {countryFlags[country.country] || '🌐'}
                    </span>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(country.revenue)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                    style={{ width: `${(country.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{Math.round((country.revenue / maxRevenue) * 100)}% of total</span>
                  <span className="text-emerald-500 font-medium">↑ 8.2%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No country data available
          </div>
        )}
        
        {sortedCountries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Global Performance</span>
              <span className="text-sm text-emerald-500 font-medium">↑ 12.4%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on revenue across all countries
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}