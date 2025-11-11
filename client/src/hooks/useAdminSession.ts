import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

type AdminSessionResponse = {
  authenticated: boolean;
};

export function useAdminSession({
  redirectToLogin = true,
}: { redirectToLogin?: boolean } = {}) {
  const [, setLocation] = useLocation();

  const { data, isLoading, isFetching, refetch, isError } =
    useQuery<AdminSessionResponse>({
      queryKey: ["/api/admin/session"],
      retry: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  const authenticated = data?.authenticated ?? false;

  useEffect(() => {
    if (!redirectToLogin) return;
    if (isLoading || isFetching) return;
    if (authenticated) return;
    setLocation("/admin/login");
  }, [authenticated, isFetching, isLoading, redirectToLogin, setLocation]);

  return {
    authenticated,
    isChecking: isLoading || isFetching,
    refetch,
    isError,
  };
}

