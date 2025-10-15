import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch current user from session
  const { data: user, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (user !== undefined || error) {
      setIsLoading(false);
    }
  }, [user, error]);

  const logout = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries and redirect
      queryClient.clear();
      window.location.href = '/';
    },
  });

  const signInWithGoogle = () => {
    window.location.href = '/api/login';
  };

  const signOut = () => {
    logout.mutate();
  };

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    signOut,
  };
}
