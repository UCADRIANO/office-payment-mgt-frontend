import React from "react";

export default function Header({ user, onLogout, onNavigate }) {
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold">Payroll Manager (Demo)</h1>
        <p className="text-sm text-gray-500">LocalStorage • Componentized</p>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-gray-700">
              Signed in as <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={() => onNavigate("/dashboard")}
              className="px-3 py-1 border rounded"
            >
              Dashboard
            </button>
            {user.role === "admin" && (
              <button
                onClick={() => onNavigate("/admin-users")}
                className="px-3 py-1 border rounded"
              >
                Admin
              </button>
            )}
            <button onClick={onLogout} className="px-3 py-1 border rounded">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate("/login")}
            className="px-3 py-1 border rounded"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
