import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DB_NAMES } from "../data/constants";
import {
  CreateUserSchemaType,
  userSchema,
} from "../validations/user.validation";

export function CreateUserForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserSchemaType>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      allowedDBs: [],
    },
  });

  const onCreate = (data: CreateUserSchemaType) => {
    console.log("User Created:", data);
    reset();
  };

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, checked } = e.target;
    const currentValues = getValues("allowedDBs") || [];

    if (checked) {
      setValue("allowedDBs", [...currentValues, value]);
    } else {
      setValue(
        "allowedDBs",
        currentValues.filter((d) => d !== value)
      );
    }

    await trigger("allowedDBs");
  };

  return (
    <form
      onSubmit={handleSubmit(onCreate)}
      className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <div className="flex flex-col">
        <label htmlFor="username" className="mb-1 font-medium">
          Username
        </label>
        <input
          id="username"
          {...register("username")}
          placeholder="Enter your username"
          className="border p-2 rounded w-full"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
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
        {errors.allowedDBs && (
          <p className="text-red-500 text-sm">{errors.allowedDBs.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <button
          disabled={isSubmitting}
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded w-full cursor-pointer"
        >
          Create user
        </button>
      </div>
    </form>
  );
}
