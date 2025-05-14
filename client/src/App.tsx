import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import CallLogs from "@/pages/call-logs";
import SMSLogs from "@/pages/sms-logs";
import RevenueReports from "@/pages/revenue-reports";
import NumberManagement from "@/pages/number-management";
import UserMessages from "@/pages/user-messages";
import Settings from "@/pages/settings";
import ApiIntegrations from "@/pages/api-integrations";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Simple protected route component
function ProtectedRoute({ 
  component: Component, 
  ...rest 
}: { 
  component: React.ComponentType;
  path: string;
}) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login
    window.location.href = "/auth";
    return null;
  }
  
  return <Component />;
}

// Basic loader to show while app initializes
function AppLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium">Loading Premium Rate Number Management System</h3>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}

// Simple redirect component
function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  
  return null;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <AppLoader />;
  }
  
  return (
    <Switch>
      <Route path="/auth">
        {user ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>
      
      <Route path="/">
        <Redirect to={user ? "/dashboard" : "/auth"} />
      </Route>
      
      <Route path="/dashboard">
        {!user ? <Redirect to="/auth" /> : <Dashboard />}
      </Route>
      
      <Route path="/calls">
        {!user ? <Redirect to="/auth" /> : <CallLogs />}
      </Route>
      
      <Route path="/sms">
        {!user ? <Redirect to="/auth" /> : <SMSLogs />}
      </Route>
      
      <Route path="/revenue">
        {!user ? <Redirect to="/auth" /> : <RevenueReports />}
      </Route>
      
      <Route path="/numbers">
        {!user ? <Redirect to="/auth" /> : <NumberManagement />}
      </Route>
      
      <Route path="/users">
        {!user ? <Redirect to="/auth" /> : <UserMessages />}
      </Route>
      
      <Route path="/settings">
        {!user ? <Redirect to="/auth" /> : <Settings />}
      </Route>
      
      <Route path="/integrations">
        {!user ? <Redirect to="/auth" /> : <ApiIntegrations />}
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="prn-admin-theme">
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
