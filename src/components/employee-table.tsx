import React, { useState } from "react";
import { Personnel } from "../interfaces";
import { Button } from "./ui/button";

interface EmployeeTableProps {
  personnel: Personnel[];
  onEdit: (record: Personnel) => void;
  onDelete: (id: Personnel) => void;
}

export function EmployeeTable({
  personnel,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [filter, setFilter] = useState("");
  const filtered = personnel.filter((r) =>
    [r.army_number, r.first_name, r.last_name, r.rank, r.sub_sector, r.bank]
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
                <td className="p-2 border">{r.army_number}</td>
                <td className="p-2 border">{r.rank}</td>
                <td className="p-2 border">
                  {r.first_name} {r.middle_name} {r.last_name}
                </td>
                <td className="p-2 border">{r.phone_number}</td>
                <td className="p-2 border">{r.bank.name}</td>
                <td className="p-2 border">{r.acct_number}</td>
                <td className="p-2 border">{r.sub_sector}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onEdit(r)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(r)}
                      className="px-2 py-1 border rounded text-red-600"
                    >
                      Delete
                    </Button>
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
