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
import NotFound from "@/pages/not-found";
import Categories from "@/pages/Categories";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tool/:slug" component={ToolDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/new" component={AdminNew} />
      <Route path="/admin/import" component={AdminImport} />
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
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
