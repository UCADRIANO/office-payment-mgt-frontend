import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllDbs, deleteDb } from "../services/admin.service";
import { useAppStore } from "../store/app-store";
import { queryClient } from "../main";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { Db } from "../interfaces";
import { Button } from "./ui/button";
import { DeleteDialog } from "./delete-dialog";

export function DbList({ setEditingDb }) {
  const setDbs = useAppStore((s) => s.setDbs);
  const [dbToDelete, setDbToDelete] = useState<Db | null>(null);

  const { data: allDbs = [], isLoading } = useQuery({
    queryKey: ["all-dbs"],
    queryFn: getAllDbs,
  });

  useEffect(() => {
    if (allDbs.length > 0) setDbs(allDbs);
  }, [allDbs, setDbs]);

  const { mutate: deleteDbMutate, isPending } = useMutation({
    mutationFn: deleteDb,
    onSuccess: () => {
      toast.success("DB deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["all-dbs"] });
    },
  });

  if (isLoading) return <p>Loading DBs...</p>;

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Databases</h3>

      {allDbs.length === 0 && <p>No databases yet.</p>}

      <div className="grid md:grid-cols-2 md:gap-8">
        {allDbs.map((db: Db) => (
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
