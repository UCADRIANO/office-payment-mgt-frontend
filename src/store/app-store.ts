import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../interfaces";
import { DB_NAMES } from "../data/constants";

interface AppStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  selectedDB: string;
  setSelectedDB: (db: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist<AppStore>(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      selectedDB: DB_NAMES[0],
      setSelectedDB: (selectedDB) => set({ selectedDB }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
