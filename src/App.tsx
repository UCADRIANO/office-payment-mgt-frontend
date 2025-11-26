import React from "react";
import { Header } from "./components/header";
import { DashboardPage } from "./pages/dashboard";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/login";
import { AdminPage } from "./pages/admin";
import { DatabasePage } from "./pages/database";
import { Toaster } from "./components/ui/sonner";

function PayrollApp() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-4 justify-center items-center">
        <Header />

        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/dashboard/admin" element={<AdminPage />} />

          <Route path="/dashboard/db/:id" element={<DatabasePage />} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster
          position="bottom-right"
          expand={true}
          richColors={true}
          closeButton={true}
        />
      </div>
    </div>
  );
}

export default function App() {
  return <PayrollApp />;
}
