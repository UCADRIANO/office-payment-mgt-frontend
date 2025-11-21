import React from "react";
import { DB_NAMES } from "../constants";
import { Link } from "react-router-dom";

export default function Dashboard({ user }) {
  const allowedDBs = user?.allowedDBs ?? [];
  const isAdmin = user?.role === "admin";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Databases</h3>
        <div className="space-y-2">
          {DB_NAMES.map((db) => (
            <Link
              key={db}
              to={`/db/${db}`}
              className={`block w-full text-left p-2 rounded ${
                allowedDBs.includes(db) || isAdmin
                  ? ""
                  : "opacity-50 pointer-events-none"
              }`}
            >
              {db}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <h4 className="font-semibold">Quick actions</h4>
          <div className="mt-2 space-y-2">
            <Link
              to={`/db/${DB_NAMES[0]}`}
              className="w-full p-2 border rounded block"
            >
              Open default DB
            </Link>
            {isAdmin && (
              <Link
                to="/admin-users"
                className="w-full p-2 border rounded block"
              >
                Manage Users
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">
            Welcome, {user?.username ?? "guest"}
          </h2>
          <p className="text-sm text-gray-500">
            Role: {user?.role ?? "none"} — Allowed DBs:{" "}
            {user?.allowedDBs?.join(", ")}
          </p>

          <div className="mt-4 bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Open a DB</h3>
          </div>

          <div className="mt-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">About</h3>
              <p className="text-sm text-gray-600 mt-2">
                This is a componentized payroll demo using localStorage. Use
                Admin to create users and assign DB access. Exports are CSV and
                browser Print (use Save as PDF).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
