import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminImport() {
  const { authenticated, isChecking } = useAdminSession();
  const { toast } = useToast();
  const style = {
    "--sidebar-width": "16rem",
  };

  const MAX_FILE_SIZE_MB = 20;

  const [selectedFileInfo, setSelectedFileInfo] = useState<{
    fileName: string;
    fileSize: number;
    rows: number;
    headers: string[];
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    imported: number;
    errors?: Array<{ row: number; message: string }>;
  } | null>(null);

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      const res = await apiRequest('POST', '/api/tools/import-csv', { csvData });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      setLastResult({
        imported: data.imported ?? 0,
        errors: data.errors,
      });
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

  const formattedLimit = `${MAX_FILE_SIZE_MB}MB`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `The selected file exceeds the ${formattedLimit} limit. Please split it into smaller files.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      if (!csvData) {
        toast({
          title: "Invalid file",
          description: "We could not read the file contents. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const lines = csvData.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const headers = lines[0]?.split(",").map((h) => h.trim()) ?? [];
      const rows = Math.max(0, lines.length - 1);

      setSelectedFileInfo({
        fileName: file.name,
        fileSize: file.size,
        rows,
        headers,
      });
      setLastResult(null);
      importMutation.mutate(csvData);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    window.open('/api/tools/csv-template', '_blank');
  };

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
                    Import multiple tools at once using a CSV file. Maximum size {formattedLimit}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed">
                      <label htmlFor="csv-upload" className={`cursor-pointer flex h-full w-full items-center justify-center ${importMutation.isPending ? "opacity-60" : ""}`}>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {importMutation.isPending ? "Uploading…" : "Click to upload CSV file"}
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
                          disabled={importMutation.isPending}
                        />
                      </label>
                    </div>

                    {selectedFileInfo && (
                      <div className="rounded-md border p-4 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{selectedFileInfo.fileName}</p>
                            <p className="text-muted-foreground">
                              {(selectedFileInfo.fileSize / (1024 * 1024)).toFixed(2)} MB · {selectedFileInfo.rows.toLocaleString()} rows
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFileInfo(null)}
                            disabled={importMutation.isPending}
                          >
                            Clear
                          </Button>
                        </div>
                        {selectedFileInfo.headers.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedFileInfo.headers.map((header) => (
                              <Badge key={header} variant="outline" className="text-xs">
                                {header || "<empty>"}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {importMutation.isPending && (
                      <p className="text-sm text-muted-foreground">
                        Processing CSV… this may take a moment for large files.
                      </p>
                    )}

                    {lastResult && (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                        <div className="flex items-center gap-2 font-medium">
                          <FileWarning className="h-4 w-4" />
                          Import summary
                        </div>
                        <p className="mt-2">
                          Imported {lastResult.imported.toLocaleString()} tools.
                        </p>
                        {lastResult.errors && lastResult.errors.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {lastResult.errors.slice(0, 5).map((err, idx) => (
                              <li key={`${err.row}-${idx}`}>
                                Row {err.row}: {err.message}
                              </li>
                            ))}
                            {lastResult.errors.length > 5 && (
                              <li>…and {lastResult.errors.length - 5} more errors.</li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
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
