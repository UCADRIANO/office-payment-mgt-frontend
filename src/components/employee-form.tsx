import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Record } from "../interfaces";
import { BANKS, RANKS, SUB_SECTORS } from "../data/constants";
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
  const [rankIsCustom, setRankIsCustom] = useState(false);
  const [subSectorIsCustom, setSubSectorIsCustom] = useState(false);

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
      bank: {
        name: "",
        sortCode: "",
      },
      accountNumber: "",
      subSector: "",
      location: "",
      remark: "",
      customRank: "",
      customSubSector: "",
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
              placeholder="Army Number"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.armyNumber && (
          <p className="text-red-500 text-sm">{errors.armyNumber.message}</p>
        )}
      </div>

      <Controller
        name="rank"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block mb-1">Rank *</label>

            {rankIsCustom ? (
              <input
                className="border p-2 rounded w-full"
                placeholder="Enter rank"
                value={field.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);

                  if (val === "") {
                    setRankIsCustom(false);
                  }
                }}
              />
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={field.value || ""}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === "Others") {
                    setRankIsCustom(true);
                    field.onChange("");
                    return;
                  }

                  field.onChange(val);
                }}
              >
                <option value="">Select Rank</option>

                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}

            {errors.rank && (
              <p className="text-red-500 text-sm">{errors.rank.message}</p>
            )}
          </div>
        )}
      />

      <div>
        <label className="block mb-1">First Name *</label>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="First Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Middle Name</label>
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Middle Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
      </div>

      <div>
        <label className="block mb-1">Last Name *</label>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Last Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Phone Number *</label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Phone Number"
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
          name="bank"
          control={control}
          render={({ field }) => (
            <select
              onChange={(e) => {
                const selected = BANKS.find((b) => b.name === e.target.value);
                field.onChange(
                  selected
                    ? { name: selected.name, sortCode: selected.sortCode }
                    : null
                );
              }}
              value={field.value?.name || ""}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Bank</option>
              {BANKS.map((b) => (
                <option key={b.sortCode} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.bank && (
          <p className="text-red-500 text-sm">{errors.bank.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Account Number *</label>
        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Account number"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm">{errors.accountNumber.message}</p>
        )}
      </div>

      <Controller
        name="subSector"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block mb-1">Sub Sector *</label>

            {subSectorIsCustom ? (
              <input
                className="border p-2 rounded w-full"
                placeholder="Enter sub sector"
                value={field.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);

                  if (val === "") {
                    setSubSectorIsCustom(false);
                  }
                }}
              />
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={field.value || ""}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === "Others") {
                    setSubSectorIsCustom(true);
                    field.onChange("");
                    return;
                  }

                  field.onChange(val);
                }}
              >
                <option value="">Select Sub Sector</option>

                {SUB_SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {errors.subSector && (
              <p className="text-red-500 text-sm">{errors.subSector.message}</p>
            )}
          </div>
        )}
      />

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
