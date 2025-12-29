import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/index";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

export function useLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: z.infer<typeof api.users.login.input>) => {
      const res = await fetch(api.users.login.path, {
        method: api.users.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error("Login failed");
      }

      return await res.json();
    },
    onSuccess: (user) => {
      // Store simple auth state in local storage for this demo since we don't have a /me endpoint in schema
      // In a real app, we'd rely on the httpOnly cookie and a /me endpoint
      localStorage.setItem("user", JSON.stringify(user));
      
      toast({
        title: "Welcome back",
        description: `Logged in as ${user.fullName}`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUser() {
  // Mocking useUser from localStorage for this specific implementation
  // since the provided schema/routes didn't include a /me endpoint
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useLogout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  return () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "See you next time",
    });
    setLocation("/");
  };
}
