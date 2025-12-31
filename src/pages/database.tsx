import React, { useRef, useState } from "react";
import { Personnel, PaginatedResponse } from "../interfaces";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeForm } from "../components/employee-form";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBulkPersonnel,
  createPersonnel,
  deletePersonnel,
  editPersonnel,
  getPersonnels,
  getPersonnelAnalytics,
  PersonnelAnalytics,
  bulkDeletePersonnels,
} from "../services/user.service";
import { toast } from "sonner";
import { queryClient } from "../main";
import { Button } from "../components/ui/button";
import { DeleteDialog } from "../components/delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export function DatabasePage() {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Personnel | null>(null);
  const [personnelsToCreateBulk, setPersonnelsToCreateBulk] = useState<
    (Partial<Personnel> & { db_id: string })[]
  >([]);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel>();
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    []
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const printableRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const location = useLocation();

  const { data, isLoading } = useQuery<PaginatedResponse<Personnel>>({
    queryKey: ["personnels", id, page, limit],
    queryFn: () => getPersonnels(id as string, page, limit),
  });

  const { data: analytics } = useQuery<PersonnelAnalytics>({
    queryKey: ["personnel-analytics", id],
    queryFn: () => getPersonnelAnalytics(id as string),
    enabled: !!id,
  });

  const personnel = data?.data || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createPersonnel,
    onSuccess: (response) => {
      toast.success(response?.data.message);
      queryClient.invalidateQueries({ queryKey: ["personnels", id] });
      queryClient.invalidateQueries({
        queryKey: ["personnel-analytics", id],
      });
      setShowForm(false);
      setFormData(null);
    },
  });

  const { mutate: editPersonnels, isPending: isEditingPersonnel } = useMutation(
    {
      mutationFn: ({
        id,
        personnel,
      }: {
        id: string;
        personnel: Partial<Personnel>;
      }) => editPersonnel(id, personnel),
      onSuccess: (response) => {
        toast.success(response?.data.message);
        queryClient.invalidateQueries({ queryKey: ["personnels", id] });
        queryClient.invalidateQueries({
          queryKey: ["personnel-analytics", id],
        });
        setShowForm(false);
        setFormData(null);
      },
    }
  );

  const { mutate: deletePersonnelMutation, isPending: isDeleteingPersonnel } =
    useMutation({
      mutationFn: deletePersonnel,
      onSuccess: (response) => {
        toast.success(response?.data?.message);
        setPersonnelToDelete(undefined);
        queryClient.invalidateQueries({ queryKey: ["personnels", id] });
        queryClient.invalidateQueries({
          queryKey: ["personnel-analytics", id],
        });
      },
    });

  const { mutate: bulkCreatePersonnel, isPending: isBulkCreating } =
    useMutation({
      mutationFn: createBulkPersonnel,
      onSuccess: (response) => {
        toast.success(
          response?.data?.message || `Personnels uploaded successfully`
        );
        queryClient.invalidateQueries({ queryKey: ["personnels", id] });
        queryClient.invalidateQueries({
          queryKey: ["personnel-analytics", id],
        });
        setShowBulkUploadModal(false);
        setPersonnelsToCreateBulk([]);
        setSelectedFileName("");
      },
    });

  const { mutate: bulkDeletePersonnelMutation, isPending: isBulkDeleting } =
    useMutation({
      mutationFn: bulkDeletePersonnels,
      onSuccess: (response) => {
        toast.success(
          response?.data?.message ||
            `${selectedPersonnelIds.length} personnels deleted successfully`
        );
        setSelectedPersonnelIds([]);
        setShowBulkDeleteDialog(false);
        queryClient.invalidateQueries({ queryKey: ["personnels", id] });
        queryClient.invalidateQueries({
          queryKey: ["personnel-analytics", id],
        });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete personnels"
        );
      },
    });

  const parseCSV = (csvText: string): Partial<Personnel>[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error(
        "CSV must contain at least a header row and one data row"
      );
    }

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const expectedHeaders = [
      "Army Number",
      "Rank",
      "First Name",
      "Middle Name",
      "Last Name",
      "Phone Number",
      "Bank Name",
      "Account Number",
      "Bank Sort Code",
      "Sub Sector",
      "Location",
      "Remark",
    ];

    // Basic header validation
    const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const personnels: Partial<Personnel>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        throw new Error(
          `Row ${i + 1}: Expected ${headers.length} columns, got ${
            values.length
          }`
        );
      }

      const personnel: Partial<Personnel> = {
        army_number: values[headers.indexOf("Army Number")]?.trim(),
        rank: values[headers.indexOf("Rank")]?.trim(),
        first_name: values[headers.indexOf("First Name")]?.trim(),
        middle_name:
          values[headers.indexOf("Middle Name")]?.trim() || undefined,
        last_name: values[headers.indexOf("Last Name")]?.trim(),
        phone_number: values[headers.indexOf("Phone Number")]?.trim(),
        bank: {
          name: values[headers.indexOf("Bank Name")]?.trim(),
          sort_code: values[headers.indexOf("Bank Sort Code")]?.trim(),
        },
        acct_number: values[headers.indexOf("Account Number")]?.trim(),
        sub_sector: values[headers.indexOf("Sub Sector")]?.trim(),
        location: values[headers.indexOf("Location")]?.trim() || undefined,
        remark: values[headers.indexOf("Remark")]?.trim() || undefined,
      };

      // Basic validation
      if (
        !personnel.army_number ||
        !personnel.first_name ||
        !personnel.last_name
      ) {
        throw new Error(
          `Row ${i + 1}: Army Number, First Name, and Last Name are required`
        );
      }

      personnels.push(personnel);
    }

    return personnels;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const text = await file.text();
      const personnels = parseCSV(text);

      if (personnels.length === 0) {
        toast.error("No valid data found in CSV");
        return;
      }

      if (personnels.length > 1000) {
        toast.error("Maximum 1000 records allowed per upload");
        return;
      }

      setPersonnelsToCreateBulk(
        personnels.map((personnel) => ({ ...personnel, db_id: id as string }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      );
    }
  };

  const exportToCSV = async () => {
    try {
      // Fetch all personnel data and analytics for export
      const [allPersonnelResponse, analytics] = await Promise.all([
        getPersonnels(id as string, 1, 10000),
        getPersonnelAnalytics(id as string),
      ]);
      const allPersonnel = allPersonnelResponse.data;

      if (allPersonnel.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Build analytics summary
      const analyticsSummary = [
        ["Personnel Analytics Summary"],
        ["Generated on:", new Date().toLocaleDateString()],
        [""],
        ["Total Personnel:", analytics.total_personnel.total],
        ["Total Active Personnel:", analytics.total_active_personnel.total],
        ["Total Inactive Personnel:", analytics.total_inactive_personnel.total],
        [
          "Active Personnel % Increase:",
          `${analytics.total_active_personnel.percentage_increase}%`,
        ],
        [
          "Inactive Personnel % Increase:",
          `${analytics.total_inactive_personnel.percentage_increase}%`,
        ],
        [
          "Total Personnel % Increase:",
          `${analytics.total_personnel.percentage_increase}%`,
        ],
        [""],
        [""],
      ];

      const headers = [
        "Army Number",
        "Rank",
        "First Name",
        "Middle Name",
        "Last Name",
        "Phone Number",
        "Bank Name",
        "Account Number",
        "Bank Sort Code",
        "Sub Sector",
        "Location",
        "Status",
        "Remark",
      ];

      const csvData = allPersonnel.map((person) => [
        person.army_number,
        person.rank,
        person.first_name,
        person.middle_name || "",
        person.last_name,
        person.phone_number,
        person.bank.name,
        person.acct_number,
        person.bank.sort_code,
        person.sub_sector,
        person.location || "",
        person.status || "",
        person.remark || "",
      ]);

      const csvContent = [
        ...analyticsSummary.map((row) =>
          row.map((field) => `"${field}"`).join(",")
        ),
        headers.map((field) => `"${field}"`).join(","),
        ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `personnel_${location.state?.dbName || "database"}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV. Please try again.");
      console.error("CSV export error:", error);
    }
  };

  const exportToPDF = async () => {
    try {
      // Fetch all personnel data and analytics for export
      const [allPersonnelResponse, analytics] = await Promise.all([
        getPersonnels(id as string, 1, 10000),
        getPersonnelAnalytics(id as string),
      ]);
      const allPersonnel = allPersonnelResponse.data;

      if (allPersonnel.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Dynamic import to avoid loading jsPDF on every page load
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Set up document
      let currentY = 20;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Personnel Report - ${location.state?.dbName || "Database"}`,
        14,
        currentY
      );
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        14,
        currentY
      );
      currentY += 10;

      // Add analytics summary
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Personnel Analytics Summary", 14, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Personnel: ${analytics.total_personnel.total}`,
        14,
        currentY
      );
      currentY += 6;
      doc.text(
        `Total Active Personnel: ${analytics.total_active_personnel.total}`,
        14,
        currentY
      );
      currentY += 6;
      doc.text(
        `Total Inactive Personnel: ${analytics.total_inactive_personnel.total}`,
        14,
        currentY
      );
      currentY += 6;
      doc.text(
        `Active Personnel % Increase: ${analytics.total_active_personnel.percentage_increase}%`,
        14,
        currentY
      );
      currentY += 6;
      doc.text(
        `Inactive Personnel % Increase: ${analytics.total_inactive_personnel.percentage_increase}%`,
        14,
        currentY
      );
      currentY += 6;
      doc.text(
        `Total Personnel % Increase: ${analytics.total_personnel.percentage_increase}%`,
        14,
        currentY
      );
      currentY += 10;

      // Define table parameters
      const startY = currentY;
      const rowHeight = 8;
      const colWidths = [25, 15, 25, 25, 25, 25, 25, 25, 25, 25, 25, 20, 30]; // Added Status column
      const headers = [
        "Army Number",
        "Rank",
        "First Name",
        "Middle Name",
        "Last Name",
        "Phone Number",
        "Bank Name",
        "Account Number",
        "Bank Sort Code",
        "Sub Sector",
        "Location",
        "Status",
        "Remark",
      ];

      // Draw headers
      currentY = startY;
      let currentX = 14;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      headers.forEach((header, index) => {
        // Draw cell border
        doc.rect(currentX, currentY, colWidths[index], rowHeight);

        // Add text
        const text =
          header.length > 12 ? header.substring(0, 12) + "..." : header;
        doc.text(text, currentX + 2, currentY + 5);

        currentX += colWidths[index];
      });

      currentY += rowHeight;

      // Draw data rows
      doc.setFont("helvetica", "normal");

      allPersonnel.forEach((person, rowIndex) => {
        // Check if we need a new page
        if (currentY + rowHeight > 190) {
          // Leave margin for footer
          doc.addPage();
          currentY = 20;
        }

        currentX = 14;

        const rowData = [
          person.army_number,
          person.rank,
          person.first_name,
          person.middle_name || "",
          person.last_name,
          person.phone_number,
          person.bank.name,
          person.acct_number,
          person.bank.sort_code,
          person.sub_sector,
          person.location || "",
          person.status || "",
          person.remark || "",
        ];

        rowData.forEach((data, colIndex) => {
          // Draw cell border
          doc.rect(currentX, currentY, colWidths[colIndex], rowHeight);

          // Add text (truncate if too long)
          const maxChars = Math.floor(colWidths[colIndex] / 2.5); // Approximate chars per column width
          const truncatedData =
            data.length > maxChars
              ? data.substring(0, maxChars - 3) + "..."
              : data;
          doc.text(truncatedData, currentX + 2, currentY + 5);

          currentX += colWidths[colIndex];
        });

        currentY += rowHeight;
      });

      // Add footer with page info
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, 14, 200);
        doc.text(`Total Records: ${allPersonnel.length}`, 200, 200);
      }

      // Save the PDF
      const filename = `personnel_${location.state?.dbName || "database"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(filename);

      setShowExportModal(false);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleFormSubmit = async (data: Partial<Personnel>) => {
    if (formMode === "add") {
      mutate({ ...data, db_id: id as string });
    } else if (formData && formMode === "edit") {
      editPersonnels({ id: formData.id, personnel: data });
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4" ref={printableRef}>
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Personnel
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics.total_personnel.total}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {analytics.total_personnel.percentage_increase > 0 ? "+" : ""}
              {analytics.total_personnel.percentage_increase}% from last period
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Active Personnel
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {analytics.total_active_personnel.total}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              {analytics.total_active_personnel.percentage_increase > 0
                ? "+"
                : ""}
              {analytics.total_active_personnel.percentage_increase}% from last
              period
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  Inactive Personnel
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {analytics.total_inactive_personnel.total}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">
              {analytics.total_inactive_personnel.percentage_increase > 0
                ? "+"
                : ""}
              {analytics.total_inactive_personnel.percentage_increase}% from
              last period
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">DB: {location.state?.dbName}</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setFormMode("add");
              setFormData(null);
              setShowForm(true);
            }}
            className="px-3 py-1 border rounded"
          >
            Add Record
          </Button>
          <Button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-3 py-1 border rounded"
          >
            Bulk Upload
          </Button>
          <Button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1 border rounded"
          >
            Export
          </Button>
          {selectedPersonnelIds.length > 0 && (
            <Button
              onClick={() => setShowBulkDeleteDialog(true)}
              className="px-3 py-1 border rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete Selected ({selectedPersonnelIds.length})
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="p-4 text-center">
            <p>Loading personnel...</p>
          </div>
        ) : (
          <>
            <EmployeeTable
              personnel={personnel}
              selectedIds={selectedPersonnelIds}
              onSelectionChange={setSelectedPersonnelIds}
              onEdit={(dataToEdit) => {
                setFormMode("edit");
                setFormData(dataToEdit);
                setShowForm(true);
              }}
              onDelete={(personnel) => setPersonnelToDelete(personnel)}
            />

            {/* Pagination Controls */}
            {meta && meta.pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, meta.total)} of {meta.total} personnel
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!meta.hasPrevPage || isLoading}
                    className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];

                      // Always show first page
                      pages.push(1);

                      // Add ellipsis if needed before current range
                      if (page > 3) {
                        pages.push("ellipsis-start");
                      }

                      // Show pages around current page
                      const startPage = Math.max(2, page - 1);
                      const endPage = Math.min(meta.pageCount - 1, page + 1);

                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== meta.pageCount) {
                          pages.push(i);
                        }
                      }

                      // Add ellipsis if needed after current range
                      if (page < meta.pageCount - 2) {
                        pages.push("ellipsis-end");
                      }

                      // Always show last page if there's more than one page
                      if (meta.pageCount > 1) {
                        pages.push(meta.pageCount);
                      }

                      return pages.map((pageItem, idx) => {
                        if (
                          pageItem === "ellipsis-start" ||
                          pageItem === "ellipsis-end"
                        ) {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2">
                              ...
                            </span>
                          );
                        }

                        const pageNum = pageItem as number;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                            className={`px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              pageNum === page
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!meta.hasNextPage || isLoading}
                    className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="mt-4">
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">
              {formMode === "add" ? "Add new record" : "Edit record"}
            </h3>
            <EmployeeForm
              mode={formMode}
              initialData={formData}
              onCancel={() => setShowForm(false)}
              onSubmit={handleFormSubmit}
              isPending={isPending || isEditingPersonnel}
            />
          </div>
        </div>
      )}

      <DeleteDialog
        name={personnelToDelete?.first_name!}
        isOpen={!!personnelToDelete}
        onConfirm={() => {
          deletePersonnelMutation(personnelToDelete?.id!);
        }}
        onCancel={() => setPersonnelToDelete(undefined)}
        isPending={isDeleteingPersonnel}
      />

      <DeleteDialog
        name={`${selectedPersonnelIds.length} personnel`}
        isOpen={showBulkDeleteDialog}
        onConfirm={() => {
          bulkDeletePersonnelMutation(selectedPersonnelIds);
        }}
        onCancel={() => setShowBulkDeleteDialog(false)}
        isPending={isBulkDeleting}
      />

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose the format you want to export the personnel data:
            </p>

            <div className="flex gap-3">
              <Button
                onClick={exportToCSV}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export as CSV
              </Button>
              <Button
                onClick={exportToPDF}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700"
              >
                Export as PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Bulk Upload Personnel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Upload a CSV file with personnel data. The file should have the
                following columns:
              </p>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Army Number, Rank, First Name, Middle Name, Last Name, Phone
                Number, Bank Name, Account Number, Bank Sort Code, Sub Sector,
                Location, Remark
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select CSV File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        // 10MB limit
                        toast.error("File size must be less than 10MB");
                        setSelectedFileName("");
                        return;
                      }
                      setSelectedFileName(file.name);
                      handleBulkUpload(file);
                    } else {
                      setSelectedFileName("");
                    }
                  }}
                  className="w-full border p-2 rounded file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  disabled={isBulkCreating}
                />
                {selectedFileName && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">{selectedFileName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setSelectedFileName("");
                }}
                className="flex-1 px-4 py-2 border rounded"
                disabled={isBulkCreating}
              >
                Cancel
              </Button>
              <Button
                disabled={isBulkCreating || personnelsToCreateBulk.length === 0}
                isLoading={isBulkCreating}
                onClick={() => bulkCreatePersonnel(personnelsToCreateBulk)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isBulkCreating ? "Uploading..." : "Upload"}
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>• Maximum 1000 records per upload</p>
              <p>• Army Number, First Name, and Last Name are required</p>
              <p>• File size limit: 10MB</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
