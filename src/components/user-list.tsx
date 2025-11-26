import React from "react";
import users from "../data";
import { User } from "../interfaces";
import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "../services/admin.service";
import { toast } from "sonner";
import { DeleteUserDialog } from "./delete-user-dialog";

interface UserListProps {
  onEdit: (user: User) => void;
}

export function UserList({ onEdit }: UserListProps) {
  const { mutate, isPending } = useMutation({
    mutationFn: deleteUser,
    onSuccess: (response) => {
      //  console.log("login res:", response?.data.data);
      toast.success(response?.data.message);
    },
  });

  const handleDelete = (user: User) => {
    mutate(user?.army_number);
  };
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
          {users.map((user) => (
            <tr key={user?.army_number}>
              <td className="p-2 border">{user.first_name}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                {(user.allowed_dbs || []).join(", ")}
              </td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-2 py-1 border rounded cursor-pointer"
                  >
                    Edit
                  </button>
                  <DeleteUserDialog
                    onConfirm={() => handleDelete(user)}
                    isPending={isPending}
                    user={user}
                  />
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
