import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from "../types";

export function useCurrentUser() {
  const hasToken = !!localStorage.getItem("auth_token");
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get("auth/me").json<UserResponse>(),
    enabled: hasToken,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: LoginRequest) =>
      api.post("auth/login", { json: req }).json<TokenResponse>(),
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.access_token);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (req: RegisterRequest) =>
      api.post("auth/register", { json: req }).json<UserResponse>(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem("auth_token");
    queryClient.clear();
    window.location.href = "/login";
  };
}
