import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authenticated, isChecking, refetch } = useAdminSession({
    redirectToLogin: false,
  });

  useEffect(() => {
    if (isChecking) return;
    if (authenticated) {
      setLocation("/admin");
    }
  }, [authenticated, isChecking, setLocation]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/admin/login", { password });
      await refetch();
      toast({
        title: "Welcome back",
        description: "You are now signed in to the admin dashboard.",
      });
      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message ?? "Invalid password, please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Admin Access
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the administrator password to continue.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || password.length === 0}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

