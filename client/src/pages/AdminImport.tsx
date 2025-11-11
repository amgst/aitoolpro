import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminImport() {
  const { toast } = useToast();
  const style = {
    "--sidebar-width": "16rem",
  };

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      const res = await apiRequest('POST', '/api/tools/import-csv', { csvData });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({
        title: "Import successful",
        description: `Imported ${data.imported} tools${data.errors ? ` with ${data.errors.length} errors` : ''}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import CSV",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target?.result as string;
        importMutation.mutate(csvData);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/tools/csv-template', '_blank');
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">Import CSV</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Download CSV Template</CardTitle>
                  <CardDescription>
                    Get a sample CSV file with the correct format for importing tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleDownloadTemplate} data-testid="button-download-template">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Import multiple tools at once using a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed">
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Click to upload CSV file
                          </p>
                          <p className="text-xs text-muted-foreground">
                            or drag and drop
                          </p>
                        </div>
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                          data-testid="input-csv-upload"
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
