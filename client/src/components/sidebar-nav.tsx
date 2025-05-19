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

  // Create a navigation item component to reduce duplication
  const NavItem = ({ href, icon: Icon, title, isActive }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        isActive ? "bg-secondary" : ""
      )}
    >
      <Link href={href}>
        <div className="flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          {title}
        </div>
      </Link>
    </Button>
  );

  return (
    <nav className="w-64 flex-shrink-0 hidden md:block border-r h-full bg-background overflow-y-auto">
      <div className="py-6 h-full flex flex-col">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Navigation
          </h2>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                isActive={location === item.href}
              />
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Integrations
          </h2>
          <div className="space-y-1">
            {integrationsNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                isActive={location === item.href}
              />
            ))}
          </div>
        </div>

        <div className="px-3 py-2 mt-auto">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                isActive={location === item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}