import React, { useState } from "react";
import { CreateUserForm } from "../components/create-user-form";
import { UserList } from "../components/user-list";
import { Db, User } from "../interfaces";
import CreateDB from "../components/create-db";
import { DbList } from "../components/DbList";

export function AdminPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDb, setEditingDb] = useState<Db | null>(null);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">User Management</h2>
      <UserList onEdit={setEditingUser} />
      <div className="mt-10">
        <h3 className="font-semibold">Create user</h3>
        <CreateUserForm
          userToEdit={editingUser as any}
          onCancel={() => setEditingUser(null)}
        />
      </div>
      <CreateDB editingDb={editingDb} />
      <DbList setEditingDb={setEditingDb} />
    </div>
  );
}
