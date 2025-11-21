import React, { useState } from "react";

export default function EmployeeTable({ records, onEdit, onDelete }) {
  const [filter, setFilter] = useState("");
  const filtered = records.filter((r) =>
    [r.armyNumber, r.firstName, r.lastName, r.rank, r.subSector, r.bankName]
      .join(" ")
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded flex-1"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Army #</th>
              <th className="p-2 border">Rank</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Bank</th>
              <th className="p-2 border">Account</th>
              <th className="p-2 border">Sub sector</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.armyNumber}</td>
                <td className="p-2 border">{r.rank}</td>
                <td className="p-2 border">
                  {r.firstName} {r.middleName} {r.lastName}
                </td>
                <td className="p-2 border">{r.phoneNumber}</td>
                <td className="p-2 border">{r.bankName}</td>
                <td className="p-2 border">{r.accountNumber}</td>
                <td className="p-2 border">{r.subSector}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(r)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      className="px-2 py-1 border rounded text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
