import React, { useEffect, useState } from "react";
import { RANKS, BANKS, SUBSECT } from "../constants";

export default function EmployeeForm({
  mode = "add",
  initialData = null,
  onCancel,
  onAdd,
  onEdit,
}) {
  const [state, setState] = useState({
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
  });

  useEffect(() => {
    if (initialData) setState(initialData);
  }, [initialData]);
  const set = (k, v) => setState((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (
      !state.armyNumber ||
      !state.rank ||
      !state.firstName ||
      !state.lastName ||
      !state.phoneNumber ||
      !state.bankName ||
      !state.accountNumber ||
      !state.subSector
    )
      return alert("Please fill required fields");
    if (mode === "add") onAdd(state);
    else onEdit(state.id, state);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <input
        value={state.armyNumber}
        onChange={(e) => set("armyNumber", e.target.value)}
        placeholder="Army Number *"
        className="border p-2 rounded"
      />
      <select
        value={state.rank}
        onChange={(e) => set("rank", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Rank</option>
        {RANKS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        value={state.firstName}
        onChange={(e) => set("firstName", e.target.value)}
        placeholder="First name *"
        className="border p-2 rounded"
      />
      <input
        value={state.middleName}
        onChange={(e) => set("middleName", e.target.value)}
        placeholder="Middle name"
        className="border p-2 rounded"
      />
      <input
        value={state.lastName}
        onChange={(e) => set("lastName", e.target.value)}
        placeholder="Last name *"
        className="border p-2 rounded"
      />
      <input
        value={state.phoneNumber}
        onChange={(e) => set("phoneNumber", e.target.value)}
        placeholder="Phone number *"
        className="border p-2 rounded"
      />
      <select
        value={state.bankName}
        onChange={(e) => set("bankName", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Bank *</option>
        {BANKS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <input
        value={state.accountNumber}
        onChange={(e) => set("accountNumber", e.target.value)}
        placeholder="Account number *"
        className="border p-2 rounded"
      />
      {/* <input
        value={state.subSector}
        onChange={(e) => set("subSector", e.target.value)}
        placeholder="Sub sector *"
        className="border p-2 rounded"
      /> */}
      <select
        value={state.subSector}
        onChange={(e) => set("subSector", e.target.value)}
        className="border p-2 rounded"
        required
      >
        <option value="">Select Sub Sector *</option>
        {SUBSECT.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        value={state.location}
        onChange={(e) => set("location", e.target.value)}
        placeholder="Location (optional)"
        className="border p-2 rounded"
      />
      <input
        value={state.remark}
        onChange={(e) => set("remark", e.target.value)}
        placeholder="Remark (optional)"
        className="border p-2 rounded"
      />

      <div className="md:col-span-2 flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {mode === "add" ? "Add" : "Update"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
