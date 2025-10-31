import create from "zustand";
import { supabase } from "../supabaseClient";
import { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null | undefined; // Thêm undefined để biết đang loading
  profile: any;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: { [key: string]: any }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: undefined,
  profile: null,
  setSession: (session) => set({ session }),
  fetchProfile: async () => {
    const user = get().session?.user;
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", user.id)
        .single();
      if (error) console.error("Error fetching profile:", error.message);
      else set({ profile: data });
    }
  },
  updateProfile: async (updates) => {
    const user = get().session?.user;
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) {
        console.error("Error updating profile", error);
      } else {
        get().fetchProfile();
      }
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    // Reset sạch sẽ và chuyển hướng bằng cách reload
    set({ session: null, profile: null });
    window.location.href = "/";
  },
}));
