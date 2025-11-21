import { create } from "zustand";
import { Message, User } from "../interfaces";
import { DB_NAMES } from "../data/constants";

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  message: Message | null;
  setMessage: (message: Message | null) => void;
  selectedDB: string;
  setSelectedDB: (db: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  message: null,
  setMessage: (message) => set({ message }),
  selectedDB: DB_NAMES[0],
  setSelectedDB: (selectedDB) => set({ selectedDB }),
}));
