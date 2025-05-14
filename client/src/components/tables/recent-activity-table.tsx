import { Card, CardContent } from "@/components/ui/card";
import { Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ActivityType } from "@shared/schema";

interface RecentActivityTableProps {
  activities?: ActivityType[];
  isLoading: boolean;
}

export default function RecentActivityTable({ activities, isLoading }: RecentActivityTableProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className="mb-6">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold">Recent Activity</h3>
        <Button variant="link" className="text-primary p-0 h-auto">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Number</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Country</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Service</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Duration/Length</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Revenue</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Timestamp</th>
              <th className="text-left py-3 px-5 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3 px-5"><Skeleton className="h-5 w-32" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-12" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-24" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-28" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-16" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-24" /></td>
                  <td className="py-3 px-5"><Skeleton className="h-5 w-12" /></td>
                </tr>
              ))
            ) : activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <tr 
                  key={`${activity.activityType}-${activity.id}`} 
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-5 text-sm">{activity.numberValue}</td>
                  <td className="py-3 px-5 text-sm">
                    <Badge 
                      variant="outline" 
                      className={`${
                        activity.activityType === 'call' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent/10 text-accent'
                      } rounded-full`}>
                      {activity.activityType === 'call' ? 'Call' : 'SMS'}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-sm">{activity.countryCode}</td>
                  <td className="py-3 px-5 text-sm">{activity.serviceType}</td>
                  <td className="py-3 px-5 text-sm">
                    {activity.activityType === 'call' 
                      ? formatDuration(activity.duration) 
                      : `${(activity as any).messageLength} chars`}
                  </td>
                  <td className="py-3 px-5 text-sm font-medium">${activity.revenue.toFixed(2)}</td>
                  <td className="py-3 px-5 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-5 text-sm">
                    <Button variant="ghost" size="icon" className="text-primary h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No activity records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-border flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {activities ? `Showing ${Math.min(activities.length, 5)} of ${activities.length} records` : "No records"}
        </span>
        <div className="flex space-x-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="default" size="sm" className="h-8 w-8">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">...</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">10</Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
}
