import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Personnel, PersonnelStatus } from "../interfaces";
import { BANKS, RANKS, SUB_SECTORS } from "../data/constants";
import { EmployeeFormSchema } from "../validations/user.validation";
import { Button } from "./ui/button";
import { Select } from "./ui/select";

interface EmployeeFormProps {
  mode?: "add" | "edit";
  initialData?: Personnel | null;
  onCancel: () => void;
  onSubmit: (data: Partial<Personnel>) => Promise<void>;
  isPending: boolean;
}

export function EmployeeForm({
  mode = "add",
  initialData = null,
  onCancel,
  onSubmit,
  isPending,
}: EmployeeFormProps) {
  const [rankIsCustom, setRankIsCustom] = useState(false);
  const [subSectorIsCustom, setSubSectorIsCustom] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Personnel>>({
    resolver: zodResolver(EmployeeFormSchema(mode === "edit")),
    defaultValues: {
      army_number: "",
      rank: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      bank: {
        name: "",
        sort_code: "",
      },
      acct_number: "",
      sub_sector: "",
      location: "",
      remark: "",
      status: "",
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
          name="army_number"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Army Number"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.army_number && (
          <p className="text-red-500 text-sm">{errors.army_number.message}</p>
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
          name="first_name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="First Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Middle Name</label>
        <Controller
          name="middle_name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Middle Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {/* {errors.middle_name && (
          <p className="text-red-500 text-sm">{errors.middle_name.message}</p>
        )} */}
      </div>

      <div>
        <label className="block mb-1">Last Name *</label>
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Last Name"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Phone Number *</label>
        <Controller
          name="phone_number"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Phone Number"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.phone_number && (
          <p className="text-red-500 text-sm">{errors.phone_number.message}</p>
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
                    ? { name: selected.name, sort_code: selected.sortCode }
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
          name="acct_number"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Account number"
              className="border p-2 rounded w-full"
            />
          )}
        />
        {errors.acct_number && (
          <p className="text-red-500 text-sm">{errors.acct_number.message}</p>
        )}
      </div>

      <Controller
        name="sub_sector"
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

            {errors.sub_sector && (
              <p className="text-red-500 text-sm">
                {errors.sub_sector.message}
              </p>
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

      {mode === "edit" && (
        <div>
          <label className="block mb-1">Status *</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Select Status"
                className="w-full"
              >
                <option value="">Select Status</option>
                <option value={PersonnelStatus.ACTIVE}>Active</option>
                <option value={PersonnelStatus.INACTIVE}>Inactive</option>
                <option value={PersonnelStatus.AWOL}>AWOL</option>
                <option value={PersonnelStatus.DEATH}>Death</option>
                <option value={PersonnelStatus.RTU}>RTU</option>
                <option value={PersonnelStatus.POSTED}>Posted</option>
                <option value={PersonnelStatus.CSE}>CSE</option>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
          )}
        </div>
      )}

      <div className="md:col-span-2 flex gap-2">
        <Button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
          isLoading={isPending}
          disabled={isPending}
        >
          {mode === "add" ? "Add" : "Update"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded cursor-pointer"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
