import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, 
  Phone, 
  MessageSquare, 
  BarChart, 
  Hash, 
  Users, 
  Settings, 
  Cable, 
  LogOut,
  Search
} from "lucide-react";

export default function SidebarNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/calls", label: "Call Logs", icon: <Phone className="w-5 h-5" /> },
    { href: "/sms", label: "SMS Logs", icon: <MessageSquare className="w-5 h-5" /> },
    { href: "/revenue", label: "Revenue Reports", icon: <BarChart className="w-5 h-5" /> },
    { href: "/numbers", label: "Number Management", icon: <Hash className="w-5 h-5" /> },
    { href: "/users", label: "User Messages", icon: <Users className="w-5 h-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    { href: "/integrations", label: "API Integrations", icon: <Cable className="w-5 h-5" /> },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="w-64 bg-white shadow-md z-20 flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white mr-2">
          <span className="font-bold">PRN</span>
        </div>
        <h1 className="text-lg font-semibold">PRN Admin Panel</h1>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul>
          {filteredNavItems.map((item) => (
            <li 
              key={item.href} 
              className={`sidebar-item ${location === item.href ? 'active' : ''}`}
            >
              <Link 
                href={item.href} 
                className={`flex items-center px-4 py-3 ${
                  location === item.href 
                    ? 'text-primary font-medium' 
                    : 'text-foreground hover:text-primary transition-colors'
                }`}
              >
                <span className="w-6">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className="bg-primary text-white">
              {user?.fullName?.split(' ').map(n => n[0]).join('') || user?.username.substring(0, 2).toUpperCase() || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.role || 'Administrator'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-auto text-muted-foreground hover:text-primary"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
