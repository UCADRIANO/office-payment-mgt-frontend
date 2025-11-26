import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DB_NAMES } from "../data/constants";
import {
  CreateUserSchemaType,
  userSchema,
} from "../validations/user.validation";
import { toast } from "sonner";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createUser, editUser } from "../services/admin.service";
import { Button } from "../components/ui/button";

interface CreateUserFormProps {
  userToEdit?: Partial<CreateUserSchemaType> & { army_number: string };
  onCancel?: () => void;
}

export function CreateUserForm({ userToEdit, onCancel }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<CreateUserSchemaType>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      allowed_dbs: [],
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (userToEdit) {
      Object.entries(userToEdit).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    } else {
      reset();
    }
  }, [userToEdit, setValue, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: (response) => {
      toast.success(response?.data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
    },
  });

  const { mutate: editUserMutation, isPending: isEditingUser } = useMutation({
    mutationFn: editUser,
    onSuccess: (response) => {
      //  console.log("login res:", response?.data.data);
      toast.success(response?.data.message);
    },
  });

  const onCreate = (data: CreateUserSchemaType) => {
    if (userToEdit) {
      editUserMutation(data);
    } else {
      mutate(data);
    }
  };

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, checked } = e.target;
    const currentValues = getValues("allowed_dbs") || [];

    if (checked) {
      setValue("allowed_dbs", [...currentValues, value]);
    } else {
      setValue(
        "allowed_dbs",
        currentValues.filter((d) => d !== value)
      );
    }

    await trigger("allowed_dbs");
  };

  return (
    <form
      onSubmit={handleSubmit(onCreate)}
      className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <div className="flex flex-col">
        <label htmlFor="first_name" className="mb-1 font-medium">
          First name
        </label>
        <input
          id="first_name"
          {...register("first_name")}
          placeholder="Enter first name"
          className="border p-2 rounded w-full"
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="last_name" className="mb-1 font-medium">
          Last name
        </label>
        <input
          id="last_name"
          {...register("last_name")}
          placeholder="Enter last name"
          className="border p-2 rounded w-full"
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm">{errors.last_name.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="army_number" className="mb-1 font-medium">
          Army number
        </label>
        <input
          id="army_number"
          {...register("army_number")}
          placeholder="Enter army number"
          className="border p-2 rounded w-full"
        />
        {errors.army_number && (
          <p className="text-red-500 text-sm">{errors.army_number.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="mb-1 font-medium">
          Password
        </label>
        <input
          id="password"
          {...register("password")}
          placeholder="Enter your password"
          type="password"
          className="border p-2 rounded w-full"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="role" className="mb-1 font-medium">
          Role
        </label>
        <select
          id="role"
          {...register("role")}
          className="border p-2 rounded w-full"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-medium">Allowed DBs</label>
        <div className="border p-2 rounded w-full">
          <div className="grid grid-cols-2 gap-1">
            {DB_NAMES.map((d) => (
              <label key={d} className="text-sm">
                <input
                  type="checkbox"
                  value={d}
                  onChange={handleCheckboxChange}
                />{" "}
                <span className="ml-2">{d}</span>
              </label>
            ))}
          </div>
        </div>
        {errors.allowed_dbs && (
          <p className="text-red-500 text-sm">{errors.allowed_dbs.message}</p>
        )}
      </div>

      <div className="flex gap-10 md:col-span-2">
        <Button
          type="submit"
          isLoading={isPending || isEditingUser}
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          {userToEdit ? "Update user" : "Create user"}
        </Button>
        {userToEdit && (
          <Button
            type="button"
            onClick={() => {
              reset();
              onCancel?.();
            }}
            className="px-4 py-2 border rounded cursor-pointer"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
