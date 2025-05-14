import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Phone, MessageSquare, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: 'revenue' | 'calls' | 'sms' | 'numbers';
  isLoading?: boolean;
}

interface StatCardsProps {
  stats: {
    totalRevenue: number;
    callMinutes: number;
    smsCount: number;
    activeNumbers: number;
  } | undefined;
  isLoading: boolean;
}

function StatCard({ title, value, change, icon, isLoading = false }: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'revenue':
        return <DollarSign className="text-primary" />;
      case 'calls':
        return <Phone className="text-secondary" />;
      case 'sms':
        return <MessageSquare className="text-accent" />;
      case 'numbers':
        return <Hash className="text-success" />;
    }
  };

  const getChangeColor = () => {
    switch (change.type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-destructive';
      case 'neutral':
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (change.type) {
      case 'increase':
        return (
          <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'decrease':
        return (
          <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'neutral':
        return (
          <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-semibold mt-1">{value}</h3>
            )}
            <p className={`text-sm flex items-center mt-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              {change.value === 0 
                ? 'No change' 
                : `${change.value > 0 ? '+' : ''}${change.value}% from last period`}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            icon === 'revenue' ? 'bg-primary/10' : 
            icon === 'calls' ? 'bg-secondary/10' : 
            icon === 'sms' ? 'bg-accent/10' : 
            'bg-success/10'
          }`}>
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatCards({ stats, isLoading }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Revenue"
        value={isLoading ? "$0.00" : `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
        change={{ value: 8.4, type: 'increase' }}
        icon="revenue"
        isLoading={isLoading}
      />
      <StatCard
        title="Call Minutes"
        value={isLoading ? 0 : stats?.callMinutes || 0}
        change={{ value: 12.3, type: 'increase' }}
        icon="calls"
        isLoading={isLoading}
      />
      <StatCard
        title="SMS Count"
        value={isLoading ? 0 : stats?.smsCount || 0}
        change={{ value: -3.6, type: 'decrease' }}
        icon="sms"
        isLoading={isLoading}
      />
      <StatCard
        title="Active Numbers"
        value={isLoading ? 0 : stats?.activeNumbers || 0}
        change={{ value: 0, type: 'neutral' }}
        icon="numbers"
        isLoading={isLoading}
      />
    </div>
  );
}
