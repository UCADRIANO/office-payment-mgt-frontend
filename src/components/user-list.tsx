import React, { useState } from "react";
import { User, PaginatedResponse } from "../interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getAllUsers } from "../services/admin.service";
import { toast } from "sonner";
import { DeleteDialog } from "./delete-dialog";
import { ResetPasswordModal } from "./reset-password-modal";

interface UserListProps {
  onEdit: (user: User) => void;
}

export function UserList({ onEdit }: UserListProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [changingPasswordUserId, setChangingPasswordUserId] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteUser,
    onSuccess: (response) => {
      setDeletingUserId(null);
      queryClient.invalidateQueries({ queryKey: ["users", page, limit] });
      toast.success(response?.data.message);
    },
  });

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, limit],
    queryFn: () => getAllUsers(page, limit),
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="mt-2 p-4 text-center">
        <p>Loading users...</p>
      </div>
    );
  }

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
          {users.length > 0 &&
            users.map((user) => (
              <tr key={user?.army_number}>
                <td className="p-2 border">{`${user.first_name} ${user?.last_name}`}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  {(user.allowed_dbs.map((db) => db.short_code) || []).join(
                    ", "
                  )}
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
                      onClick={() => setChangingPasswordUserId(user.id)}
                      className="px-2 py-1 border rounded text-blue-600 cursor-pointer"
                    >
                      Change Password
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

                    <ResetPasswordModal
                      isOpen={changingPasswordUserId === user.id}
                      onClose={() => setChangingPasswordUserId(null)}
                      userId={user.id!}
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

      {/* Pagination Controls */}
      {meta && meta.pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, meta.total)} of {meta.total} users
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!meta.hasPrevPage || isLoading}
              className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {(() => {
                const pages: (number | string)[] = [];

                // Always show first page
                pages.push(1);

                // Add ellipsis if needed before current range
                if (page > 3) {
                  pages.push("ellipsis-start");
                }

                // Show pages around current page
                const startPage = Math.max(2, page - 1);
                const endPage = Math.min(meta.pageCount - 1, page + 1);

                for (let i = startPage; i <= endPage; i++) {
                  if (i !== 1 && i !== meta.pageCount) {
                    pages.push(i);
                  }
                }

                // Add ellipsis if needed after current range
                if (page < meta.pageCount - 2) {
                  pages.push("ellipsis-end");
                }

                // Always show last page if there's more than one page
                if (meta.pageCount > 1) {
                  pages.push(meta.pageCount);
                }

                return pages.map((pageItem, idx) => {
                  if (
                    pageItem === "ellipsis-start" ||
                    pageItem === "ellipsis-end"
                  ) {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2">
                        ...
                      </span>
                    );
                  }

                  const pageNum = pageItem as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className={`px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        pageNum === page
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!meta.hasNextPage || isLoading}
              className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
