import { useState } from 'react';
import { Bell, Settings, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface HeaderNavProps {
  title: string;
  toggleSidebar: () => void;
}

export default function HeaderNav({ title, toggleSidebar }: HeaderNavProps) {
  const [location] = useLocation();
  
  // Function to format the title based on the current route
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/calls':
        return 'Call Logs';
      case '/sms':
        return 'SMS Logs';
      case '/revenue':
        return 'Revenue Reports';
      case '/numbers':
        return 'Number Management';
      case '/users':
        return 'User Messages';
      case '/settings':
        return 'Settings';
      case '/integrations':
        return 'API Integrations';
      default:
        return title;
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="md:hidden mr-4 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
