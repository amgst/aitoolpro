import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ToolDetail from "@/pages/ToolDetail";
import Admin from "@/pages/Admin";
import AdminNew from "@/pages/AdminNew";
import AdminImport from "@/pages/AdminImport";
import AdminSettings from "@/pages/AdminSettings";
import AdminLogin from "@/pages/AdminLogin";
import AdminEdit from "@/pages/AdminEdit";
import NotFound from "@/pages/not-found";
import Categories from "@/pages/Categories";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import About from "@/pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tool/:slug" component={ToolDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/new" component={AdminNew} />
      <Route path="/admin/import" component={AdminImport} />
      <Route path="/admin/edit/:id" component={AdminEdit} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
