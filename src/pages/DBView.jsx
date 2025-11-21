import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  toCsv,
  download,
} from "../utils/storage";

export default function DBView({ user }) {
  const { dbName } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!dbName) navigate("/dashboard");
  }, [dbName]);

  const [records, setRecords] = useState(() => getRecords(dbName));
  useEffect(() => setRecords(getRecords(dbName)), [dbName]);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState(null);
  const printableRef = useRef();

  const refresh = () => setRecords(getRecords(dbName));
  const handleAdd = (data) => {
    try {
      addRecord(dbName, data);
      refresh();
      setShowForm(false);
    } catch (e) {
      alert(e.message);
    }
  };
  const handleEdit = (id, data) => {
    try {
      updateRecord(dbName, id, data);
      refresh();
      setShowForm(false);
    } catch (e) {
      alert(e.message);
    }
  };
  const handleDelete = (id) => {
    if (!confirm("Delete record?")) return;
    deleteRecord(dbName, id);
    refresh();
  };
  const handleExport = () => {
    const csv = toCsv(records);
    if (!csv) return alert("No records to export");
    download(`${dbName}_export.csv`, csv);
  };
  const handlePrint = () => window.print();

  return (
    <div className="bg-white p-4 rounded shadow mt-4" ref={printableRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">DB: {dbName}</h2>
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
          <button onClick={handleExport} className="px-3 py-1 border rounded">
            Export CSV
          </button>
          <button onClick={handlePrint} className="px-3 py-1 border rounded">
            Print
          </button>
        </div>
      </div>

      <div className="mt-4">
        <EmployeeTable
          records={records}
          onEdit={(r) => {
            setFormMode("edit");
            setFormData(r);
            setShowForm(true);
          }}
          onDelete={handleDelete}
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
              onAdd={handleAdd}
              onEdit={handleEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
