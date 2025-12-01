import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateUserSchemaType,
  userSchema,
  editUserSchema,
  EditUserSchemaType,
} from "../validations/user.validation";

type UserFormData = CreateUserSchemaType | EditUserSchemaType;
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createUser, editUser } from "../services/admin.service";
import { Button } from "../components/ui/button";
import { ShowPasswordModal } from "./show-password-modal";
import { useAppStore } from "../store/app-store";
import { queryClient } from "../main";

interface CreateUserFormProps {
  userToEdit?: Partial<CreateUserSchemaType> & {
    army_number: string;
    id: string;
  };
  onCancel?: () => void;
}

export function CreateUserForm({ userToEdit, onCancel }: CreateUserFormProps) {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { dbs } = useAppStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userToEdit ? editUserSchema : userSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      allowed_dbs: [],
    },
  });

  useEffect(() => {
    if (userToEdit) {
      Object.entries(userToEdit).forEach(([key, value]) => {
        if (key === "allowed_dbs") {
          // Convert Db objects to array of IDs for the form
          const dbIds = Array.isArray(value)
            ? value.map((db: any) => db?.id || db).filter(Boolean)
            : [];
          setValue(key as any, dbIds);
        } else {
          setValue(key as any, value);
        }
      });
      setGeneratedPassword("");
    } else {
      setGeneratedPassword("");
      reset();
    }
  }, [userToEdit, setValue, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: createUser,
    onSuccess: (response) => {
      toast.success(response?.data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      setShowPasswordModal(true);
    },
  });

  const { mutate: editUserMutation, isPending: isEditingUser } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateUserSchemaType>;
    }) => editUser(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      toast.success(response?.data.message);
    },
  });

  const onCreate = (data: UserFormData) => {
    if (userToEdit) {
      // For editing, exclude password if not provided
      const { password, ...editData } = data;
      const editPayload = password ? { ...editData, password } : editData;
      editUserMutation({ id: userToEdit.id!, data: editPayload });
    } else {
      mutate(data as CreateUserSchemaType);
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    setValue("password", pass);
    trigger("password");
  };
  return (
    <>
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
            placeholder={
              userToEdit
                ? "Password cannot be changed here"
                : "Enter your password"
            }
            type="text"
            className="border p-2 rounded w-full"
            readOnly
            disabled={!!userToEdit}
          />
          {!userToEdit && (
            <button
              type="button"
              onClick={generatePassword}
              className="text-blue-600 underline text-sm cursor-pointer"
            >
              Generate password
            </button>
          )}
          {userToEdit && (
            <p className="text-gray-500 text-sm">
              Use the "Change Password" button in the user list to update
              password
            </p>
          )}
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
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Allowed DBs</label>
          <div className="border p-2 rounded w-full">
            <div className="grid grid-cols-2 gap-1">
              {dbs.length > 0 ? (
                dbs.map((d) => (
                  <label key={d?.id} className="text-sm">
                    <input
                      type="checkbox"
                      value={d?.id}
                      {...register("allowed_dbs")}
                    />{" "}
                    <span className="ml-2">{d?.short_code}</span>
                  </label>
                ))
              ) : (
                <div className="text-sm">Empty DB, please add one!</div>
              )}
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
                setGeneratedPassword("");
                setShowPasswordModal(false);
                onCancel?.();
              }}
              className="px-4 py-2 border rounded cursor-pointer"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      {showPasswordModal && (
        <ShowPasswordModal
          password={generatedPassword}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}
