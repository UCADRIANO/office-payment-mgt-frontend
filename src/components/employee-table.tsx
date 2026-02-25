import React, { useMemo, useState } from "react";
import { Personnel } from "../interfaces";
import { Button } from "./ui/button";

interface EmployeeTableProps {
  personnel: Personnel[];
  onEdit: (record: Personnel) => void;
  onDelete: (id: Personnel) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortOrder = "asc" | "desc" | null;

export function EmployeeTable({
  personnel,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectionChange,
}: EmployeeTableProps) {
  const [statusSort, setStatusSort] = useState<SortOrder>(null);

  // Sort personnel
  const sortedPersonnel = useMemo(() => {
    let result = [...personnel];

    // Apply status sort
    if (statusSort) {
      result.sort((a, b) => {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();
        if (statusSort === "asc") {
          return statusA.localeCompare(statusB);
        } else {
          return statusB.localeCompare(statusA);
        }
      });
    }

    return result;
  }, [personnel, statusSort]);

  const isAllSelected =
    sortedPersonnel.length > 0 &&
    sortedPersonnel.every((p) => selectedIds.includes(p.id));
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < sortedPersonnel.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(sortedPersonnel.map((p) => p.id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectOne = (personnelId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, personnelId]);
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== personnelId));
      }
    }
  };

  const handleSortToggle = () => {
    if (statusSort === null) {
      setStatusSort("asc");
    } else if (statusSort === "asc") {
      setStatusSort("desc");
    } else {
      setStatusSort(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button
          onClick={handleSortToggle}
          variant={statusSort ? "default" : "outline"}
          className="whitespace-nowrap h-10"
        >
          Sort by Status
          {statusSort === "asc" && " ↑"}
          {statusSort === "desc" && " ↓"}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {onSelectionChange && (
                <th className="p-2 border w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
              )}
              <th className="p-2 border">Army #</th>
              <th className="p-2 border">Rank</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Bank</th>
              <th className="p-2 border">Account</th>
              <th className="p-2 border">Sub sector</th>
              <th className="p-2 border">
                <div className="flex items-center gap-1">
                  Status
                  {statusSort && (
                    <span className="text-xs">
                      {statusSort === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPersonnel.map((r) => (
              <tr key={r.id}>
                {onSelectionChange && (
                  <td className="p-2 border">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={(e) => handleSelectOne(r.id, e.target.checked)}
                      className="cursor-pointer"
                    />
                  </td>
                )}
                <td className="p-2 border">{r.army_number}</td>
                <td className="p-2 border">{r.rank}</td>
                <td className="p-2 border">
                  {r.first_name} {r.middle_name} {r.last_name}
                </td>
                <td className="p-2 border">{r.phone_number}</td>
                <td className="p-2 border">{r.bank?.name || ""}</td>
                <td className="p-2 border">{r.acct_number}</td>
                <td className="p-2 border">{r.sub_sector}</td>
                <td className="p-2 border capitalize">{r.status || "-"}</td>
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
            {sortedPersonnel.length === 0 && (
              <tr>
                <td
                  colSpan={onSelectionChange ? 10 : 9}
                  className="p-4 text-center"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
