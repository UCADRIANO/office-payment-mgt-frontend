import React, { useRef, useState } from "react";
import { Record } from "../interfaces";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeForm } from "../components/employee-form";
import { useParams } from "react-router-dom";

export function DatabasePage() {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Record | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();

  const mockRecords: Record[] = [
    {
      id: "1",
      armyNumber: "12345",
      rank: "Corporal",
      firstName: "John",
      middleName: "K.",
      lastName: "Doe",
      phoneNumber: "123-456-7890",
      bank: {
        name: "Zenith Bank",
        sortCode: "04133",
      },
      accountNumber: "00123456789",
      subSector: "Infantry",
    },
    {
      id: "2",
      armyNumber: "67890",
      rank: "Private",
      firstName: "Jane",
      middleName: "M.",
      lastName: "Smith",
      phoneNumber: "098-765-4321",
      bank: {
        name: "First Bank",
        sortCode: "04136",
      },
      accountNumber: "00987654321",
      subSector: "Logistics",
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleFormSubmit = async (data: Partial<Record>) => {
    if (formMode === "add") {
      console.log("create new record:", data);
      console.log("formData on create:", formData);
    } else if (formData && formMode === "edit") {
      console.log(formData);
      console.log(data);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4" ref={printableRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">DB: {id}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormMode("add");
              setFormData(null);
              setShowForm(true);
            }}
            className="px-3 py-1 border rounded"
          >
            Add Record
          </button>
          <button className="px-3 py-1 border rounded">
            {/* Export CSV button can be added later */}
            Export CSV
          </button>
          <button onClick={handlePrint} className="px-3 py-1 border rounded">
            Print
          </button>
        </div>
      </div>

      <div className="mt-4">
        <EmployeeTable
          records={mockRecords}
          onEdit={(dataToEdit) => {
            setFormMode("edit");
            setFormData(dataToEdit);
            setShowForm(true);
          }}
          onDelete={(id) => console.log(`Delete record with id: ${id}`)}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
