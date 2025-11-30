import React, { useState } from "react";
import { User } from "../interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getAllUsers } from "../services/admin.service";
import { toast } from "sonner";
import { DeleteDialog } from "./delete-dialog";

interface UserListProps {
  onEdit: (user: User) => void;
}

export function UserList({ onEdit }: UserListProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteUser,
    onSuccess: (response) => {
      setDeletingUserId(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(response?.data.message);
    },
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  return (
    <div className="mt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Allowed DBs</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user?.army_number}>
              <td className="p-2 border">{`${user.first_name} ${user?.last_name}`}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                {(user.allowed_dbs.map((db) => db.short_code) || []).join(", ")}
              </td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-2 py-1 border rounded cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeletingUserId(user.id)}
                    className="px-2 py-1 border rounded text-red-600 cursor-pointer"
                  >
                    Delete
                  </button>

                  <DeleteDialog
                    name={user?.first_name}
                    isOpen={deletingUserId === user.id}
                    onConfirm={() => {
                      mutate(user.id);
                      setDeletingUserId(null);
                    }}
                    onCancel={() => setDeletingUserId(null)}
                    isPending={isPending}
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
