import { useAppStore } from "../store/app-store";

export function useAuth() {
  const { setUser } = useAppStore();

  const handleLogout = () => {
    setUser(null);
  };

  return { handleLogout };
}
