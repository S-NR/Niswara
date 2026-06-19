import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "../domain/models";

interface AuthState {
  user: User | null;
  login: (name: string, role?: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (name, role = "student") =>
        set({ user: { id: crypto.randomUUID(), name, role } }),
      logout: () => set({ user: null })
    }),
    { name: "mla:user" }
  )
);