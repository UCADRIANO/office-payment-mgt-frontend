import React, { useRef, useState } from "react";
import { Personnel } from "../interfaces";
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const printableRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const location = useLocation();

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["personnels"],
    queryFn: () => getPersonnels(id as string),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPersonnel,
    onSuccess: (response) => {
      toast.success(response?.data.message);
      queryClient.invalidateQueries({ queryKey: ["personnels"] });
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
        queryClient.invalidateQueries({ queryKey: ["personnels"] });
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
        queryClient.invalidateQueries({ queryKey: ["personnels"] });
      },
    });

  const { mutate: bulkCreatePersonnel, isPending: isBulkCreating } =
    useMutation({
      mutationFn: createBulkPersonnel,
      onSuccess: (response) => {
        toast.success(
          response?.data?.message || `Personnels uploaded successfully`
        );
        queryClient.invalidateQueries({ queryKey: ["personnels"] });
        setShowBulkUploadModal(false);
        setPersonnelsToCreateBulk([]);
        setSelectedFileName("");
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

  const exportToCSV = () => {
    if (personnel.length === 0) {
      toast.error("No data to export");
      return;
    }

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
      "Remark",
    ];

    const csvData = personnel.map((person) => [
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
      person.remark || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

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
  };

  const exportToPDF = async () => {
    if (personnel.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Dynamic import to avoid loading jsPDF on every page load
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Set up document
      doc.setFontSize(18);
      doc.text(
        `Personnel Report - ${location.state?.dbName || "Database"}`,
        14,
        20
      );
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Define table parameters
      const startY = 40;
      const rowHeight = 8;
      const colWidths = [25, 15, 25, 25, 25, 25, 25, 25, 25, 25, 25, 30]; // Column widths
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
        "Remark",
      ];

      // Draw headers
      let currentY = startY;
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

      personnel.forEach((person, rowIndex) => {
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
        doc.text(`Total Records: ${personnel.length}`, 200, 200);
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
        </div>
      </div>

      <div className="mt-4">
        <EmployeeTable
          personnel={personnel}
          onEdit={(dataToEdit) => {
            setFormMode("edit");
            setFormData(dataToEdit);
            setShowForm(true);
          }}
          onDelete={(personnel) => setPersonnelToDelete(personnel)}
        />
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
