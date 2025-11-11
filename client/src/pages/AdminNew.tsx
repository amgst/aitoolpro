import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import ToolForm from "@/components/ToolForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { InsertTool } from "@shared/schema";

export default function AdminNew() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "16rem",
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertTool) => {
      const res = await apiRequest('POST', '/api/tools', data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({
        title: "Tool created",
        description: `${data.name} has been added successfully.`,
      });
      setLocation('/admin');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tool",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertTool) => {
    createMutation.mutate(data);
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">Add New Tool</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl">
              <ToolForm onSubmit={handleSubmit} submitLabel="Create Tool" />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
