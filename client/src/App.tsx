import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
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
import ProvidersPage from "@/pages/providers";
import PaymentManagement from "@/pages/payment-management";
import AutoResponders from "@/pages/auto-responders";
import CDIRPage from "@/pages/cdir";
import ApiDocsPage from "@/pages/api-docs";
import ApiKeysPage from "@/pages/api-keys";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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

function App() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <AppLoader />;
  }
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="prn-admin-theme">
      <TooltipProvider>
        <Toaster />
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
          
          <Route path="/revenue-reports">
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
          
          <Route path="/providers">
            {!user ? <Redirect to="/auth" /> : <ProvidersPage />}
          </Route>
          
          <Route path="/payment-management">
            {!user ? <Redirect to="/auth" /> : <PaymentManagement />}
          </Route>
          
          <Route path="/auto-responders">
            {!user ? <Redirect to="/auth" /> : <AutoResponders />}
          </Route>
          
          <Route path="/cdir">
            {!user ? <Redirect to="/auth" /> : <CDIRPage />}
          </Route>
          
          <Route path="/api-docs">
            {!user ? <Redirect to="/auth" /> : <ApiDocsPage />}
          </Route>
          
          <Route path="/api-keys">
            {!user ? <Redirect to="/auth" /> : <ApiKeysPage />}
          </Route>
          
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
