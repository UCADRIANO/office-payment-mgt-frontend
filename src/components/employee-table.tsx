import React, { useMemo, useState } from "react";
import { Personnel, PersonnelStatus } from "../interfaces";
import { Button } from "./ui/button";
import { Select } from "./ui/select";

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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statusSort, setStatusSort] = useState<SortOrder>(null);

  // Status enum values
  const statusOptions = [
    { value: PersonnelStatus.ACTIVE, label: "Active" },
    { value: PersonnelStatus.INACTIVE, label: "Inactive" },
  ];

  // Filter and sort personnel
  const filteredAndSorted = useMemo(() => {
    let result = [...personnel];

    // Apply status filter
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

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
  }, [personnel, statusFilter, statusSort]);

  const isAllSelected =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((p) => selectedIds.includes(p.id));
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filteredAndSorted.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(filteredAndSorted.map((p) => p.id));
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
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Filter by status"
          className="w-[200px] h-10"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Button
          onClick={handleSortToggle}
          variant={statusSort ? "default" : "outline"}
          className="whitespace-nowrap h-10"
        >
          Sort by Status
          {statusSort === "asc" && " ↑"}
          {statusSort === "desc" && " ↓"}
        </Button>
        {statusFilter && (
          <Button
            onClick={() => setStatusFilter("")}
            variant="ghost"
            size="sm"
            className="whitespace-nowrap"
          >
            Clear Filter
          </Button>
        )}
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
            {filteredAndSorted.map((r) => (
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
            {filteredAndSorted.length === 0 && (
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
