import { useRoute, useLocation } from "wouter";
import { useAdminSession } from "@/hooks/useAdminSession";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import ToolForm from "@/components/ToolForm";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertTool, Tool } from "@shared/schema";
import { Card } from "@/components/ui/card";

function toInsertTool(tool: Tool): InsertTool {
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    shortDescription: tool.shortDescription,
    category: tool.category,
    pricing: tool.pricing,
    websiteUrl: tool.websiteUrl,
    logoUrl: tool.logoUrl,
    features: tool.features ?? [],
    tags: tool.tags ?? [],
    badge: tool.badge,
    rating: tool.rating,
    sourceDetailUrl: tool.sourceDetailUrl,
    developer: tool.developer,
    documentationUrl: tool.documentationUrl,
    socialLinks: tool.socialLinks,
    useCases: tool.useCases,
    screenshots: tool.screenshots,
    pricingDetails: tool.pricingDetails,
    launchDate: tool.launchDate,
    lastUpdated: tool.lastUpdated,
  };
}

export default function AdminEdit() {
  const { authenticated, isChecking } = useAdminSession();
  const [, params] = useRoute("/admin/edit/:id");
  const toolId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: tool, isLoading, isError, error } = useQuery<Tool>({
    queryKey: ["/api/tools", toolId],
    enabled: authenticated && !!toolId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertTool) => {
      if (!toolId) {
        throw new Error("Missing tool identifier");
      }
      const res = await apiRequest("PATCH", `/api/tools/${toolId}`, data);
      return await res.json();
    },
    onSuccess: (updated: Tool) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast({
        title: "Tool updated",
        description: `${updated.name} has been saved successfully.`,
      });
      setLocation("/admin");
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message ?? "Unable to save changes.",
        variant: "destructive",
      });
    },
  });

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking admin access…</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (!toolId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Tool identifier missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading tool…</p>
      </div>
    );
  }

  if (isError || !tool) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <Card className="max-w-lg p-6">
          <h2 className="text-2xl font-semibold">Failed to load tool</h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "Unable to find this tool."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">Edit Tool</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl">
              <ToolForm
                initialData={toInsertTool(tool)}
                onSubmit={(data) => updateMutation.mutate(data)}
                submitLabel={updateMutation.isPending ? "Saving…" : "Save Changes"}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

