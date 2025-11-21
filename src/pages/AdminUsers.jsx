import React, { useEffect, useState } from "react";
import { getUsers, saveUsers } from "../utils/storage";
import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import { useNavigate } from "react-router-dom";

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/login");
  }, [user]);
  const [users, setUsers] = useState(() => getUsers());

  useEffect(() => setUsers(getUsers()), []);

  const handleCreateUser = (u) => {
    const ulist = getUsers();
    if (ulist.some((x) => x.username === u.username))
      return alert("Username exists");
    ulist.push({ ...u, id: `u_${Date.now()}` });
    saveUsers(ulist);
    setUsers(ulist);
  };
  const handleDeleteUser = (id) => {
    if (!confirm("Delete user?")) return;
    const ulist = getUsers().filter((x) => x.id !== id);
    saveUsers(ulist);
    setUsers(ulist);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">User Management</h2>
      <UserList users={users} onDelete={handleDeleteUser} />
      <div className="mt-4">
        <h3 className="font-semibold">Create user</h3>
        <CreateUserForm onCreate={handleCreateUser} />
      </div>
    </div>
  );
}
