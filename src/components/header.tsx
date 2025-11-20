import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppStore } from "../store/app-store";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { handleLogout } = useAuth();
  const { user } = useAppStore();
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold">Payroll Manager</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* {user ? ( */}
        <>
          <div className="text-sm text-gray-700">
            Signed in as{" "}
            <span className="font-medium">{user?.username || "Kele"}</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/dashboard/admin")}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Admin
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Logout
          </button>
        </>
        {/* ) : ( */}
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1 border rounded cursor-pointer"
        >
          Login
        </button>
        {/* )} */}
      </div>
    </header>
  );
}
