import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Materials from "@/pages/materials";
import Suppliers from "@/pages/suppliers";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import InvoiceForm from "@/pages/invoice-form";
import InventoryList from "@/pages/inventory-list";
import InventorySummary from "@/pages/inventory-summary";
import Users from "@/pages/users";
import Messages from "./pages/messages";
import Employees from "./pages/employees";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const user = useUser();
  const [, setLocation] = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    // We use a small timeout to avoid render cycle conflicts
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Public Route */}
      <Route path="/" component={Login} />

      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/materials">
        <ProtectedRoute component={Materials} />
      </Route>
      <Route path="/suppliers">
        <ProtectedRoute component={Suppliers} />
      </Route>
      <Route path="/invoices">
        <ProtectedRoute component={Invoices} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/import">
        <ProtectedRoute component={() => <InvoiceForm type="IMPORT" />} />
      </Route>
      <Route path="/export">
        <ProtectedRoute component={() => <InvoiceForm type="EXPORT" />} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={InventoryList} />
      </Route>
      <Route path="/inventory-summary">
        <ProtectedRoute component={InventorySummary} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={Messages} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={Users} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
