import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminSettings() {
  const { authenticated, isChecking } = useAdminSession();
  const style = {
    "--sidebar-width": "16rem",
  };

  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showBetaBadges, setShowBetaBadges] = useState(true);
  const [supportEmail, setSupportEmail] = useState("support@example.com");
  const [announcement, setAnnouncement] = useState("");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been stored locally.",
    });
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
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General</CardTitle>
                  <CardDescription>
                    Configure high-level options that affect the entire
                    directory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                    <div>
                      <Label htmlFor="switch-maintenance-mode">
                        Maintenance mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable public access while you perform
                        updates.
                      </p>
                    </div>
                    <Switch
                      id="switch-maintenance-mode"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                      data-testid="switch-maintenance-mode"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                    <div>
                      <Label htmlFor="switch-beta-badges">Beta badges</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight tools that are still in beta on the public
                        directory.
                      </p>
                    </div>
                    <Switch
                      id="switch-beta-badges"
                      checked={showBetaBadges}
                      onCheckedChange={setShowBetaBadges}
                      data-testid="switch-beta-badges"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Contact</CardTitle>
                  <CardDescription>
                    Update the email address or message that visitors see on the
                    contact page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-support-email">Support email</Label>
                    <Input
                      id="input-support-email"
                      value={supportEmail}
                      onChange={(event) => setSupportEmail(event.target.value)}
                      type="email"
                      placeholder="you@example.com"
                      data-testid="input-support-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-announcement">
                      Announcement banner
                    </Label>
                    <Textarea
                      id="textarea-announcement"
                      value={announcement}
                      onChange={(event) => setAnnouncement(event.target.value)}
                      placeholder="Share updates with your community..."
                      data-testid="textarea-announcement"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This message shows at the top of the homepage. Leave blank
                      to hide it.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} data-testid="button-save-settings">
                    Save changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

