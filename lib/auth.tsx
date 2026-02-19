import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "./query-client";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from "firebase/auth";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  cpid: string | null;
  savedEvents: string[] | null;
  memberOf: string[] | null;
  roleGlobal: string | null;
  referralCode: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  firebaseUid: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (data: { username: string; password: string; name: string; email?: string; city?: string; state?: string; country?: string; phone?: string; referralCode?: string }) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; city?: string; state?: string; country?: string; phone?: string; website?: string; socialLinks?: Record<string, string> }) => Promise<AuthUser>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
    retry: false,
  });

  const login = useCallback(async (username: string, password: string): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    const data = await res.json();
    queryClient.setQueryData(["/api/auth/me"], data);
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/memberships"] });
    return data;
  }, []);

  const register = useCallback(async (regData: { username: string; password: string; name: string; email?: string; city?: string; state?: string; country?: string; phone?: string; referralCode?: string }): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/register", regData);
    const data = await res.json();
    queryClient.setQueryData(["/api/auth/me"], data);
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<AuthUser | null> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const res = await apiRequest("POST", "/api/auth/firebase", { idToken });
    const data = await res.json();
    queryClient.setQueryData(["/api/auth/me"], data);
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/memberships"] });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/memberships"] });
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; email?: string; city?: string; state?: string; website?: string; socialLinks?: Record<string, string> }): Promise<AuthUser> => {
    const res = await apiRequest("PUT", "/api/users/profile", data);
    const updated = await res.json();
    queryClient.setQueryData(["/api/auth/me"], updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      refetchUser: refetch,
    }),
    [user, isLoading, login, register, loginWithGoogle, logout, updateProfile, refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
