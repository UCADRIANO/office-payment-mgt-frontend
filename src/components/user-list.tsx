import React from "react";
import users from "../data";

export function UserList() {
  return (
    <div className="mt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Allowed DBs</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{(u.allowedDBs || []).join(", ")}</td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Edit user not implemented")}
                    className="px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => alert("User deleted")}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
