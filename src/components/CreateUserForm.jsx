import React, { useState } from "react";
import { DB_NAMES } from "../constants";

export default function CreateUserForm({ onCreate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [allowedDBs, setAllowedDBs] = useState([]);

  const toggleDb = (db) =>
    setAllowedDBs((s) =>
      s.includes(db) ? s.filter((x) => x !== db) : [...s, db]
    );

  const submit = (e) => {
    e.preventDefault();
    if (!username || !password) return alert("username & password required");
    onCreate({ username, password, role, allowedDBs });
    setUsername("");
    setPassword("");
    setRole("user");
    setAllowedDBs([]);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        className="border p-2 rounded"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        className="border p-2 rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="border p-2 rounded">
        <div className="text-sm font-medium mb-1">Allowed DBs</div>
        <div className="grid grid-cols-2 gap-1">
          {DB_NAMES.map((d) => (
            <label key={d} className="text-sm">
              <input
                type="checkbox"
                checked={allowedDBs.includes(d)}
                onChange={() => toggleDb(d)}
              />{" "}
              <span className="ml-2">{d}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create user
        </button>
      </div>
    </form>
  );
}
