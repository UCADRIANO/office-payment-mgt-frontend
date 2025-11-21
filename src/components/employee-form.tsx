import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Record } from "../interfaces";
import { BANKS, RANKS } from "../data/constants";
import { EmployeeFormSchema } from "../validations/user.validation";

interface EmployeeFormProps {
  mode?: "add" | "edit";
  initialData?: Record | null;
  onCancel: () => void;
  onSubmit: (data: Partial<Record>) => Promise<void>;
}

export function EmployeeForm({
  mode = "add",
  initialData = null,
  onCancel,
  onSubmit,
}: EmployeeFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Record>>({
    resolver: zodResolver(EmployeeFormSchema(mode === "edit")),
    defaultValues: {
      armyNumber: "",
      rank: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      bankName: "",
      accountNumber: "",
      subSector: "",
      location: "",
      remark: "",
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <div>
        <label className="block mb-1">Army Number *</label>
        <Controller
          name="armyNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Army Number *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.armyNumber && (
          <p className="text-red-500 text-sm">{errors.armyNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Rank *</label>
        <Controller
          name="rank"
          control={control}
          render={({ field }) => (
            <select {...field} className="border p-2 rounded w-full">
              {" "}
              // Full width
              <option value="">Select rank</option>
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        />
        {errors.rank && (
          <p className="text-red-500 text-sm">{errors.rank.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">First name *</label>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="First name *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Middle name</label>
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Middle name"
              className="border p-2 rounded w-full"
            />
          )}
        />
      </div>

      <div>
        <label className="block mb-1">Last name *</label>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Last name *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Phone number *</label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Phone number *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Bank *</label>
        <Controller
          name="bankName"
          control={control}
          render={({ field }) => (
            <select {...field} className="border p-2 rounded w-full">
              <option value="">Select bank *</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        />
        {errors.bankName && (
          <p className="text-red-500 text-sm">{errors.bankName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Account number *</label>
        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Account number *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm">{errors.accountNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Sub sector *</label>
        <Controller
          name="subSector"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Sub sector *"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.subSector && (
          <p className="text-red-500 text-sm">{errors.subSector.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Location (optional)</label>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Location (optional)"
              className="border p-2 rounded w-full"
            />
          )}
        />
      </div>

      <div>
        <label className="block mb-1">Remark (optional)</label>
        <Controller
          name="remark"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Remark (optional)"
              className="border p-2 rounded w-full"
            />
          )}
        />
      </div>

      <div className="md:col-span-2 flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          {mode === "add" ? "Add" : "Update"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
