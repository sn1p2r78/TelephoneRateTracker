import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall, MessageSquare, HashIcon, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardsProps {
  stats?: any;
  isLoading?: boolean;
}

export default function StatCards({ stats, isLoading = false }: StatCardsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalRevenue: 0,
    callMinutes: 0,
    smsCount: 0,
    activeNumbers: 0
  });

  useEffect(() => {
    if (isLoading || !stats) return;

    const animationDuration = 1500; // ms
    const steps = 40;
    const interval = animationDuration / steps;

    const targetStats = {
      totalRevenue: stats.totalRevenue || 0,
      callMinutes: stats.callMinutes || 0,
      smsCount: stats.smsCount || 0,
      activeNumbers: stats.activeNumbers || 0
    };

    let step = 0;

    const timer = setInterval(() => {
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
        return;
      }

      const progress = step / steps;
      // Using easeOutQuad easing function for smoother animation
      const easedProgress = 1 - (1 - progress) * (1 - progress);

      setAnimatedStats({
        totalRevenue: Math.round(targetStats.totalRevenue * easedProgress),
        callMinutes: Math.round(targetStats.callMinutes * easedProgress),
        smsCount: Math.round(targetStats.smsCount * easedProgress),
        activeNumbers: Math.round(targetStats.activeNumbers * easedProgress)
      });

      step++;
    }, interval);

    return () => clearInterval(timer);
  }, [stats, isLoading]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(animatedStats.totalRevenue),
      description: "From all services",
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      trend: "up",
      change: "+12.5%",
      iconBackground: "bg-emerald-100 dark:bg-emerald-900"
    },
    {
      title: "Call Minutes",
      value: formatNumber(animatedStats.callMinutes),
      description: "Voice minutes used",
      icon: <PhoneCall className="h-5 w-5 text-blue-500" />,
      trend: "up",
      change: "+8.3%",
      iconBackground: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "SMS Count",
      value: formatNumber(animatedStats.smsCount),
      description: "Messages sent/received",
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      trend: "up",
      change: "+15.2%",
      iconBackground: "bg-indigo-100 dark:bg-indigo-900"
    },
    {
      title: "Active Numbers",
      value: formatNumber(animatedStats.activeNumbers),
      description: "Premium rate numbers",
      icon: <HashIcon className="h-5 w-5 text-violet-500" />,
      trend: "up",
      change: "+3.7%",
      iconBackground: "bg-violet-100 dark:bg-violet-900"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {statCards.map((card, index) => (
        <Card key={index} className="overflow-hidden border">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                  <div className={`p-2 rounded-full ${card.iconBackground}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{card.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{card.description}</span>
                  <span className={`text-xs font-medium ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {card.change}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}