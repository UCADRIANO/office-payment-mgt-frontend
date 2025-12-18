import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/app-store";
import { useQuery } from "@tanstack/react-query";
import { Db, PaginatedResponse } from "../interfaces";
import {
  getAllDbs,
  getDashboardAnalytics,
  DashboardAnalytics,
} from "../services/admin.service";
import { getPersonnels } from "../services/user.service";
import { Button } from "../components/ui/button";
import { ChangePasswordModal } from "../components/change-password-modal";
import { DatabaseChart } from "../components/database-chart";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, dbs, setDbs } = useAppStore();
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const { data: dbsResponse } = useQuery<PaginatedResponse<Db>>({
    queryKey: ["all-dbs", 1, 10],
    queryFn: () => getAllDbs(1, 10),
  });

  const allDbs = dbsResponse?.data || [];

  // Get dashboard analytics
  const { data: analytics } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: getDashboardAnalytics,
  });

  // Get personnel counts for each database
  const { data: personnelCounts = {} } = useQuery({
    queryKey: ["personnel-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      const databasesToCheck =
        user?.role === "admin" ? dbs : user?.allowed_dbs || [];

      for (const db of databasesToCheck) {
        try {
          const personnelsResponse = await getPersonnels(db.id, 1, 1);
          counts[db.id] = personnelsResponse.meta.total;
        } catch (error) {
          console.error(`Failed to get personnels for DB ${db.id}:`, error);
          counts[db.id] = 0;
        }
      }
      return counts;
    },
    enabled: dbs.length > 0 && !!user,
  });

  useEffect(() => {
    if (allDbs.length > 0) setDbs(allDbs);
  }, [allDbs, setDbs]);

  useEffect(() => {
    // Check if user needs password reset
    if (user && user.is_generated && user.role !== "admin") {
      setShowPasswordReset(true);
    }
  }, [user]);

  // Prepare chart data based on user role
  const chartData = React.useMemo(() => {
    const databasesToShow =
      user?.role === "admin" ? dbs : user?.allowed_dbs || [];
    return databasesToShow.map((db) => ({
      db,
      count: personnelCounts[db.id] || 0,
    }));
  }, [dbs, user, personnelCounts]);

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
        {user?.role === "admin" && (
          <div className="mt-6">
            <h4 className="font-semibold">Quick actions</h4>
            <div className="mt-2 space-y-2">
              <Button
                onClick={() => navigate(`/dashboard/admin/dbs`)}
                className="w-full p-2 border rounded"
              >
                Manage DBs
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-3">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Welcome, {user?.first_name}</h2>
          <p className="text-sm text-gray-500">
            Role: {user?.role} — Allowed DBs:{" "}
            {user?.allowed_dbs &&
              user.allowed_dbs.length > 0 &&
              user.allowed_dbs.map((db) => (
                <span key={db.id}>{db.short_code} </span>
              ))}
          </p>

          <div className="mt-4">
            <h3 className="font-semibold">Open a DB</h3>
            <p className="text-sm text-gray-600 mt-2">
              Select a database from the sidebar
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total Databases
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analytics.databases.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {analytics.databases.percentage_increase > 0 ? "+" : ""}
                {analytics.databases.percentage_increase}% from last period
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Total Personnel
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {analytics.personnel.total}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                {analytics.personnel.percentage_increase > 0 ? "+" : ""}
                {analytics.personnel.percentage_increase}% from last period
              </p>
            </div>
          </div>
        )}

        {/* Database Chart with Summary */}
        {chartData.length > 0 && (
          <div className="mt-4">
            <DatabaseChart data={chartData} />
          </div>
        )}

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

      <ChangePasswordModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </div>
  );
}
