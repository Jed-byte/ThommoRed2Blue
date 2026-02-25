import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

// Client-side user type (without password)
export type ClientUser = Omit<User, 'password'>;

export function useAuth() {
  const { data: user, isLoading } = useQuery<ClientUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}