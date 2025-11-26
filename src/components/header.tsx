import React from "react";
import { useAppStore } from "../store/app-store";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { setUser } = useAppStore();
  const { user } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold">Payroll Manager</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm text-gray-700">
              Signed in as{" "}
              <span className="font-medium">{user?.first_name || "User"}</span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1 border rounded cursor-pointer"
            >
              Dashboard
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/dashboard/admin")}
                className="px-3 py-1 border rounded cursor-pointer"
              >
                Admin
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
