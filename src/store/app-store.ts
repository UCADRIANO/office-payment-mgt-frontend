import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Db, User } from "../interfaces";

interface AppStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  dbs: Db[];
  setDbs: (dbs: Db[]) => void;
}

export const useAppStore = create<AppStore>()(
  persist<AppStore>(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      dbs: [],
      setDbs: (dbs) => set({ dbs }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
