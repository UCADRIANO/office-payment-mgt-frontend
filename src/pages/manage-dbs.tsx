import React, { useState } from "react";
import { Db } from "../interfaces";
import CreateDB from "../components/create-db";
import { DbList } from "../components/DbList";

const ManageDbs = () => {
  const [editingDb, setEditingDb] = useState<Db | null>(null);
  return (
    <div className="bg-white p-4 rounded shadow">
      <CreateDB editingDb={editingDb} />
      <DbList setEditingDb={setEditingDb} />
    </div>
  );
};

export default ManageDbs;
