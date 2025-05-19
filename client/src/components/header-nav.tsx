import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  LogOut, 
  Menu,
  MessageSquare, 
  Settings, 
  User
} from "lucide-react";

interface HeaderNavProps {
  title?: string;
  toggleSidebar: () => void;
}

export default function HeaderNav({ title, toggleSidebar }: HeaderNavProps) {
  const { user, logoutMutation } = useAuth();
  const [notifications, setNotifications] = useState<number>(3);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b flex items-center px-4 md:px-6 justify-between bg-background/95 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg md:text-xl">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                PR
              </div>
              <span className="hidden md:inline">PremiumRate</span>
            </a>
          </Link>
          
          {title && (
            <>
              <span className="hidden md:inline text-muted-foreground">/</span>
              <span className="font-medium">{title}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New SMS message</p>
                  <p className="text-xs text-muted-foreground">You received a new SMS message from +123456789</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Number request approved</p>
                  <p className="text-xs text-muted-foreground">Your request for premium numbers has been approved</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-primary/10">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">System update</p>
                  <p className="text-xs text-muted-foreground">The platform has been updated with new features</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setNotifications(0)}>
              Mark all as read
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} />
                <AvatarFallback>{user?.username ? getInitials(user.username) : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user-dashboard">
                <a className="cursor-pointer flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <a className="cursor-pointer flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}