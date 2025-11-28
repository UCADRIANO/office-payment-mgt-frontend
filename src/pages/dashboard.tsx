import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/app-store";
import { useQuery } from "@tanstack/react-query";
import { Db } from "../interfaces";
import { getAllDbs } from "../services/admin.service";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, dbs, setDbs } = useAppStore();

  const { data: allDbs = [] } = useQuery<Db[]>({
    queryKey: ["all-dbs"],
    queryFn: getAllDbs,
  });

  useEffect(() => {
    if (allDbs.length > 0) setDbs(allDbs);
  }, [allDbs, setDbs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Databases</h3>
        <div className="space-y-2">
          {dbs?.length > 0 ? (
            dbs.map((db) => (
              <button
                key={db?.id}
                onClick={() =>
                  navigate(`/dashboard/db/${db?.id}`, {
                    state: {
                      dbName: db?.name,
                    },
                  })
                }
                className="cursor-pointer w-full text-left p-2 rounded hover:bg-gray-50"
              >
                {db?.short_code}
              </button>
            ))
          ) : (
            <div className="space-y-2">
              <div className="text-gray-500 text-xs">No DB found</div>
              <button
                onClick={() => navigate(`/dashboard/admin`)}
                className="p-1 border rounded cursor-pointer text-xs"
              >
                Create DB
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">Quick actions</h4>
          <div className="mt-2 space-y-2">
            {/* <button
              onClick={() => navigate(`/dashboard/db/${DB_NAMES[0]}`)}
              className="w-full p-2 border rounded cursor-pointer"
            >
              Open default DB
            </button> */}

            {user?.role === "admin" && (
              <button
                onClick={() => navigate(`/dashboard/admin`)}
                className="w-full p-2 border rounded"
              >
                Manage Users
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Welcome, {user?.first_name}</h2>
          <p className="text-sm text-gray-500">
            Role: admin — Allowed DBs:{" "}
            {user?.allowed_dbs &&
              user.allowed_dbs.length > 0 &&
              user.allowed_dbs.map((db) => <span key={db}>{db} </span>)}
          </p>

          <div className="mt-4">
            <h3 className="font-semibold">Open a DB</h3>
            <p className="text-sm text-gray-600 mt-2">
              Select a database from the sidebar
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-gray-600 mt-2">
              This is a payroll system using a local backend server. Use Admin
              to create users and assign DB access. Exports are CSV and browser
              Print (use Save as PDF).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
