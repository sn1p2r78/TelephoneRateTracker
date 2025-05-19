import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Key,
  LayoutDashboard,
  MessageSquare,
  Phone,
  PhoneCall,
  Settings,
  ShieldCheck,
  Smartphone,
  UserCircle2,
  Wallet,
  Webhook,
} from "lucide-react";

export default function SidebarNav() {
  const [location] = useLocation();
  
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/user-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Number Requests",
      href: "/number-requests",
      icon: Smartphone,
    },
    {
      title: "Call Logs",
      href: "/call-logs",
      icon: PhoneCall,
    },
    {
      title: "SMS Logs",
      href: "/sms-logs",
      icon: MessageSquare,
    },
    {
      title: "CDIR History",
      href: "/cdir",
      icon: FileText,
    },
    {
      title: "Payment Profile",
      href: "/payment-profile",
      icon: Wallet,
    }
  ];
  
  const integrationsNavItems = [
    {
      title: "Auto-Responders",
      href: "/auto-responders",
      icon: MessageSquare,
    },
    {
      title: "API Integrations",
      href: "/api-integrations",
      icon: Webhook,
    },
    {
      title: "API Keys",
      href: "/api-keys",
      icon: Key,
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: FileText,
    }
  ];
  
  const adminNavItems = [
    {
      title: "User Management",
      href: "/user-management",
      icon: UserCircle2,
    },
    {
      title: "Number Management",
      href: "/number-management",
      icon: Phone,
    },
    {
      title: "Providers",
      href: "/providers",
      icon: ShieldCheck,
    },
    {
      title: "Revenue Reports",
      href: "/revenue-reports",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    }
  ];

  return (
    <nav className="w-64 flex-shrink-0 hidden md:block border-r h-full bg-background overflow-y-auto">
      <div className="py-6 h-full flex flex-col">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Navigation
          </h2>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "bg-secondary" : ""
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <a className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </a>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Integrations
          </h2>
          <div className="space-y-1">
            {integrationsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "bg-secondary" : ""
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <a className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </a>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="px-3 py-2 mt-auto">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "bg-secondary" : ""
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <a className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </a>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}