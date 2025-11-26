import React, { useState } from "react";
import { CreateUserForm } from "../components/create-user-form";
import { UserList } from "../components/user-list";
import { User } from "../interfaces";

export function AdminPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">User Management</h2>
      <UserList onEdit={setEditingUser} />
      <div className="mt-4">
        <h3 className="font-semibold">Create user</h3>
        <CreateUserForm
          userToEdit={editingUser || undefined}
          onCancel={() => setEditingUser(null)}
        />
      </div>
    </div>
  );
}
