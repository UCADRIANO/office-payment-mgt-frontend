import React, { useRef, useState } from "react";
import { Personnel } from "../interfaces";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeForm } from "../components/employee-form";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPersonnel,
  deletePersonnel,
  editPersonnel,
  getPersonnels,
} from "../services/user.service";
import { toast } from "sonner";
import { queryClient } from "../main";
import { Button } from "../components/ui/button";
import { DeleteDialog } from "../components/delete-dialog";

export function DatabasePage() {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Personnel | null>(null);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel>();
  const printableRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const location = useLocation();

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["personnels"],
    queryFn: () => getPersonnels(id as string),
  });

  const handlePrint = () => {
    window.print();
  };

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
          <Button className="px-3 py-1 border rounded">Export CSV</Button>
          <Button onClick={handlePrint} className="px-3 py-1 border rounded">
            Print
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
    </div>
  );
}
