import React, { useState } from "react";
import { getUsers } from "../utils/storage";

export default function LoginCard({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  const doLogin = () => {
    const u = getUsers().find(
      (x) => x.username === username && x.password === password
    );
    if (!u) return alert("Invalid credentials");
    onLogin(u);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Login</h2>
      <div className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full border p-2 rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={doLogin}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Login
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Default admin: admin / admin</p>
    </div>
  );
}
