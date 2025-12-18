import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllDbs, deleteDb } from "../services/admin.service";
import { useAppStore } from "../store/app-store";
import { queryClient } from "../main";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { Db, PaginatedResponse } from "../interfaces";
import { Button } from "./ui/button";
import { DeleteDialog } from "./delete-dialog";

export function DbList({ setEditingDb }) {
  const setDbs = useAppStore((s) => s.setDbs);
  const [dbToDelete, setDbToDelete] = useState<Db | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useQuery<PaginatedResponse<Db>>({
    queryKey: ["all-dbs", page, limit],
    queryFn: () => getAllDbs(page, limit),
  });

  const allDbs = data?.data || [];
  const meta = data?.meta;

  useEffect(() => {
    if (allDbs.length > 0) setDbs(allDbs);
  }, [allDbs, setDbs]);

  const { mutate: deleteDbMutate, isPending } = useMutation({
    mutationFn: deleteDb,
    onSuccess: () => {
      toast.success("DB deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["all-dbs", page, limit] });
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) return <p>Loading DBs...</p>;

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Databases</h3>

      {allDbs.length === 0 && <p>No databases yet.</p>}

      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        {allDbs.length > 0 &&
          allDbs.map((db: Db) => (
            <div
              key={db.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{db.name}</p>
                <p className="text-sm text-gray-500">{db.short_code}</p>
                <p className="text-sm text-gray-500">{db.description}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="px-3 py-1 border rounded"
                  onClick={() =>
                    setEditingDb({
                      id: db.id,
                      name: db.name,
                      short_code: db.short_code,
                      description: db.description || "",
                    })
                  }
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setDbToDelete(db)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination Controls */}
      {meta && meta.pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, meta.total)} of {meta.total} databases
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

      <DeleteDialog
        name={dbToDelete?.name!}
        isOpen={!!dbToDelete}
        onConfirm={() => {
          deleteDbMutate(dbToDelete?.id!);
          setDbToDelete(null);
        }}
        onCancel={() => setDbToDelete(null)}
        isPending={isPending}
      />
    </div>
  );
}
