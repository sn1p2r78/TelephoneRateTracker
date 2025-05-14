import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={() => {
        // Redirect to auth if not on auth page
        window.location.pathname = "/auth";
        return null;
      }} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/calls" component={CallLogs} />
      <ProtectedRoute path="/sms" component={SMSLogs} />
      <ProtectedRoute path="/revenue" component={RevenueReports} />
      <ProtectedRoute path="/numbers" component={NumberManagement} />
      <ProtectedRoute path="/users" component={UserMessages} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/integrations" component={ApiIntegrations} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="prn-admin-theme">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
