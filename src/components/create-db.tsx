import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DbFormType, dbSchema } from "../validations/db.validation";
import { createDb, editDb } from "../services/admin.service";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { queryClient } from "../main";

const CreateDB = ({ editingDb }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DbFormType>({
    resolver: zodResolver(dbSchema),
  });

  useEffect(() => {
    if (editingDb) {
      setValue("name", editingDb.name);
      setValue("short_code", editingDb.short_code);
      setValue("description", editingDb.description || "");
    } else {
      reset();
    }
  }, [editingDb, setValue, reset]);

  const { mutate: createDbMutate, isPending: isCreatingDb } = useMutation({
    mutationFn: createDb,
    onSuccess: () => {
      toast.success("Database created successfully");
      queryClient.invalidateQueries({ queryKey: ["all-dbs"] });
      reset();
    },
    onError: () => toast.error("Failed to create database"),
  });

  const { mutate: editDbMutate, isPending: isEditingDb } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DbFormType> }) =>
      editDb(id, data),
    onSuccess: () => {
      toast.success("Database updated successfully");
      queryClient.invalidateQueries({ queryKey: ["all-dbs"] });
      reset();
    },
    onError: () => toast.error("Failed to update database"),
  });

  const onSubmit = (data: DbFormType) => {
    if (editingDb?.id) {
      editDbMutate({ id: editingDb.id, data });
    } else {
      createDbMutate(data);
    }
  };

  return (
    <div className="mt-10 max-w-md">
      <h3 className="font-semibold mb-2">
        {editingDb ? "Edit Database" : "Create Database"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            {...register("name")}
            className="border p-2 rounded w-full"
            placeholder="Database name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Short Code</label>
          <input
            {...register("short_code")}
            className="border p-2 rounded w-full"
            placeholder="Short code"
          />
          {errors.short_code && (
            <p className="text-red-500 text-sm">{errors.short_code.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            {...register("description")}
            className="border p-2 rounded w-full"
            placeholder="Description (optional)"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            isLoading={isCreatingDb || isEditingDb}
            className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
          >
            {editingDb ? "Update DB" : "Create DB"}
          </Button>
          {editingDb && (
            <Button
              type="button"
              onClick={() => {
                reset();
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateDB;
