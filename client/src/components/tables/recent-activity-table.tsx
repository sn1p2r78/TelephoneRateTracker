import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  User, 
  Hash 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ActivityType } from "@shared/schema";
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityTableProps {
  activities?: ActivityType[];
  isLoading?: boolean;
}

export default function RecentActivityTable({
  activities = [],
  isLoading = false
}: RecentActivityTableProps) {

  const formatPhoneNumber = (number: string) => {
    if (!number) return '';
    // Assuming international format with country codes
    return number.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  };
  
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Unknown date';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">In Progress</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-emerald-500">Delivered</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last 24 hours</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Duration/Size</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted p-1.5 rounded-full">
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {activity.activityType}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{formatPhoneNumber(activity.numberValue)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {activity.activityType === 'call' 
                            ? formatPhoneNumber(activity.caller || '') 
                            : formatPhoneNumber(activity.recipient || '')
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {activity.activityType === 'call' ? 
                        `${activity.duration || 0} sec` : 
                        `${activity.messageContent?.length || 0} chars`
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(activity.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recent activities found
          </div>
        )}
      </CardContent>
    </Card>
  );
}