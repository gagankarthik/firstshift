// components/providers/UserProvider.tsx
"use client";
import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at?: string;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
};

const UserContext = React.createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadProfile = React.useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      const userProfile: UserProfile = {
        id: userId,
        full_name: data?.full_name ?? null,
        avatar_url: data?.avatar_url ?? null,
        email: user?.email ?? null,
        created_at: user?.created_at,
      };

      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [supabase, user?.email, user?.created_at]);

  const refreshProfile = React.useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  const updateProfile = React.useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-profile-updated', {
        detail: { ...profile, ...updates }
      }));

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  }, [user?.id, supabase, profile]);

  React.useEffect(() => {
    const initializeUser = async () => {
      setLoading(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser?.id) {
        await loadProfile(currentUser.id);
      }

      setLoading(false);
    };

    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const value: UserContextType = {
    user,
    profile,
    loading,
    updateProfile,
    refreshProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}