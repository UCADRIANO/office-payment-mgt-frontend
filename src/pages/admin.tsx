import React from "react";
import { CreateUserForm } from "../components/create-user-form";
import { UserList } from "../components/user-list";

export function AdminPage() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">User Management</h2>
      <UserList />
      <div className="mt-4">
        <h3 className="font-semibold">Create user</h3>
        <CreateUserForm />
      </div>
    </div>
  );
}
