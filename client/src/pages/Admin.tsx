import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@shared/schema";
import { useState } from "react";

type PagedTools = { items: Tool[]; total: number };

export default function Admin() {
  const { toast } = useToast();
  const style = {
    "--sidebar-width": "16rem",
  };

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery<PagedTools>({
    queryKey: ['admin-tools', page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      const res = await fetch(`/api/tools?${params.toString()}`, { credentials: "include" });
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(text);
      }
      const totalHeader = res.headers.get("x-total-count");
      const items = await res.json();
      return { items, total: totalHeader ? parseInt(totalHeader, 10) : items.length };
    },
    keepPreviousData: true,
  });

  const tools = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/tools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({
        title: "Tool deleted",
        description: "The tool has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tool",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Tools {total ? `(${total})` : ""}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading tools...</div>
                ) : tools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tools found. Add your first tool!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between rounded-md border p-4 hover-elevate"
                        data-testid={`row-tool-${tool.slug}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <span className="font-bold">{tool.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-medium" data-testid={`text-name-${tool.slug}`}>
                              {tool.name}
                            </h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {tool.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {tool.pricing}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => console.log('Edit', tool.id)}
                            data-testid={`button-edit-${tool.slug}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(tool.id, tool.name)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${tool.slug}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages} {total ? `(Total ${total})` : ""}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                          Previous
                        </Button>
                        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
