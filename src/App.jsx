// import React, { useEffect, useState, useRef } from "react";
// import { Routes, Route, useNavigate } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import LoginPage from "./pages/LoginPage";
// import AdminUsers from "./pages/AdminUsers";
// import DBView from "./pages/DBView";
// import {
//   createDefaultAdminIfEmpty,
//   readSession,
//   writeSession,
// } from "./utils/storage";
// import Header from "./components/Header";

// export default function App() {
//   useEffect(() => createDefaultAdminIfEmpty(), []);

//   const [user, setUser] = useState(() => readSession());
//   useEffect(() => writeSession(user), [user]);

//   const navigate = useNavigate();

//   const onLogout = () => {
//     setUser(null);
//     navigate("/login");
//   };

//   const onNavigate = (p) => navigate(p);

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       <div className="max-w-6xl mx-auto p-4">
//         <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />

//         <Routes>
//           <Route
//             path="/login"
//             element={<LoginPage onLogin={(u) => setUser(u)} />}
//           />
//           <Route path="/" element={<Dashboard user={user} />} />
//           <Route path="/dashboard" element={<Dashboard user={user} />} />
//           <Route path="/admin-users" element={<AdminUsers user={user} />} />
//           <Route path="/db/:dbName" element={<DBView user={user} />} />
//           <Route path="*" element={<Dashboard user={user} />} />
//         </Routes>
//       </div>

//       <footer className="text-center text-xs text-gray-500 p-4">
//         Payroll demo • Data stored in browser localStorage
//       </footer>
//     </div>
//   );
// }

import "./App.css";

import React, { useEffect, useState, useRef } from "react";

const DB_NAMES = ["OPWS", "CHEC", "SETRACO", "ZHONG"];
const RANKS = [
  "Maj Gen",
  "Brig Gen",
  "Col",
  "Lt Col",
  "Maj",
  "Capt",
  "Lt",
  "2Lt",
  "MWO",
  "WO",
  "SSgt",
  "Sgt",
  "Cpl",
  "LCpl",
  "Pte",
];
const BANKS = [
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "FCMB",
  "UBA",
  "Union Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "Polaris Bank",
  "Keystone Bank",
  "Wema Bank",
  "Fidelity Bank",
];
const SUBSECT = [
  "Sub Sector 1A",
  "Sub Sector 1B",
  "Sub Sector 1C",
  "Sub Sector 1D",
];

// localStorage helpers
const LS_USERS = "ps_users_v1";
const LS_SESSION = "ps_session_v1";
const DB_KEY = (db) => `ps_db_${db}`;

function readLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// User management in localStorage
function getUsers() {
  return readLS(LS_USERS) || [];
}
function saveUsers(users) {
  writeLS(LS_USERS, users);
}
function createDefaultAdminIfEmpty() {
  const users = getUsers();
  if (users.length === 0) {
    const admin = {
      id: "u_admin",
      username: "admin",
      password: "admin",
      role: "admin",
      allowedDBs: [...DB_NAMES],
    };
    saveUsers([admin]);
  }
}

// DB helpers
function getRecords(db) {
  return readLS(DB_KEY(db)) || [];
}
function saveRecords(db, records) {
  writeLS(DB_KEY(db), records);
}
function addRecord(db, record) {
  const records = getRecords(db);
  if (records.some((r) => r.armyNumber === record.armyNumber)) {
    throw new Error("Army Number must be unique in this DB");
  }
  const r = {
    ...record,
    id: `r_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  records.push(r);
  saveRecords(db, records);
  return r;
}
function updateRecord(db, id, changes) {
  const records = getRecords(db).map((r) =>
    r.id === id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r
  );
  saveRecords(db, records);
}
function deleteRecord(db, id) {
  const records = getRecords(db).filter((r) => r.id !== id);
  saveRecords(db, records);
}

// CSV export
function toCsv(records) {
  if (!records || records.length === 0) return "";
  const keys = Object.keys(records[0]).filter(
    (k) => !["id", "createdAt", "updatedAt"].includes(k)
  );
  const lines = [keys.join(",")];
  for (const r of records) {
    const row = keys
      .map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }
  return lines.join("\n");
}
function download(filename, content, mime = "text/csv") {
  const blob = new Blob([content], { type: mime + ";charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// small utility
const formatName = (r) =>
  `${r.rank} ${r.firstName}${r.middleName ? " " + r.middleName : ""} ${
    r.lastName
  }`;

export default function PayrollSingleFileApp() {
  // initialize
  useEffect(() => createDefaultAdminIfEmpty(), []);

  // Auth state
  const [user, setUser] = useState(() => readLS(LS_SESSION));

  useEffect(() => writeLS(LS_SESSION, user), [user]);

  // App state
  const [view, setView] = useState(user ? "dashboard" : "login"); // 'login' | 'dashboard' | 'admin-users' | 'db'
  const [selectedDB, setSelectedDB] = useState(DB_NAMES[0]);
  const [records, setRecords] = useState(() => getRecords(DB_NAMES[0]));
  const [message, setMessage] = useState(null);

  // Employee form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [formData, setFormData] = useState(null);

  // user management
  const [users, setUsers] = useState(() => getUsers());

  useEffect(() => setUsers(getUsers()), []);

  // reload records when DB changes or after CRUD
  useEffect(() => setRecords(getRecords(selectedDB)), [selectedDB]);

  // Login handler
  const handleLogin = (username, password) => {
    const u = getUsers().find(
      (x) => x.username === username && x.password === password
    );
    if (!u) {
      setMessage({ type: "error", text: "Invalid credentials" });
      return;
    }
    setUser(u);
    setView("dashboard");
    setMessage({ type: "success", text: `Welcome ${u.username}` });
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LS_SESSION);
    setView("login");
  };

  // Admin user create
  const handleCreateUser = ({ username, password, role, allowedDBs }) => {
    const ulist = getUsers();
    if (ulist.some((x) => x.username === username)) {
      setMessage({ type: "error", text: "Username exists" });
      return;
    }
    const newUser = {
      id: `u_${Date.now()}`,
      username,
      password,
      role,
      allowedDBs,
    };
    ulist.push(newUser);
    saveUsers(ulist);
    setUsers(ulist);
    setMessage({ type: "success", text: "User created" });
  };

  const handleDeleteUser = (id) => {
    if (!confirm("Delete user?")) return;
    const ulist = getUsers().filter((u) => u.id !== id);
    saveUsers(ulist);
    setUsers(ulist);
    setMessage({ type: "success", text: "User deleted" });
  };

  // CRUD for records
  const refreshRecords = () => setRecords(getRecords(selectedDB));

  const handleAddRecord = (data) => {
    try {
      addRecord(selectedDB, data);
      refreshRecords();
      setShowForm(false);
      setMessage({ type: "success", text: "Record added" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  };
  const handleEditRecord = (id, data) => {
    try {
      updateRecord(selectedDB, id, data);
      refreshRecords();
      setShowForm(false);
      setMessage({ type: "success", text: "Record updated" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  };
  const handleDeleteRecord = (id) => {
    if (!confirm("Delete record?")) return;
    deleteRecord(selectedDB, id);
    refreshRecords();
    setMessage({ type: "success", text: "Record deleted" });
  };

  const handleExportCsv = (rows) => {
    const csv = toCsv(rows);
    if (!csv) {
      setMessage({ type: "error", text: "No records to export" });
      return;
    }
    download(`${selectedDB}_export.csv`, csv, "text/csv");
  };

  const printableRef = useRef();
  const handlePrint = () => {
    window.print();
  };

  // helpers for rendering
  const isAdmin = user?.role === "admin";
  const allowedDBs = user?.allowedDBs ?? [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        <Header
          user={user}
          onLogout={handleLogout}
          onNavigate={(v) => setView(v)}
        />

        {message && (
          <div
            className={`my-3 p-3 rounded ${
              message.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {message.text}
            <button
              className="ml-4 text-sm underline"
              onClick={() => setMessage(null)}
            >
              dismiss
            </button>
          </div>
        )}

        {!user && view === "login" && <LoginCard onLogin={handleLogin} />}

        {user && view === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Databases</h3>
              <div className="space-y-2">
                {DB_NAMES.map((db) => (
                  <button
                    key={db}
                    onClick={() => {
                      setSelectedDB(db);
                      setView("db");
                    }}
                    disabled={!allowedDBs.includes(db) && !isAdmin}
                    className={`w-full text-left p-2 rounded ${
                      selectedDB === db
                        ? "bg-green-50 border"
                        : "hover:bg-gray-50"
                    } ${
                      !allowedDBs.includes(db) && !isAdmin
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {db}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold">Quick actions</h4>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedDB(DB_NAMES[0]);
                      setView("db");
                    }}
                    className="w-full p-2 border rounded"
                  >
                    Open default DB
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setView("admin-users")}
                      className="w-full p-2 border rounded"
                    >
                      Manage Users
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold">
                  Welcome, {user.username}
                </h2>
                <p className="text-sm text-gray-500">
                  Role: {user.role} — Allowed DBs: {user.allowedDBs?.join(", ")}
                </p>

                <div className="mt-4">
                  <h3 className="font-semibold">Open a DB</h3>
                  <div className="flex gap-2 mt-2">
                    <select
                      value={selectedDB}
                      onChange={(e) => setSelectedDB(e.target.value)}
                      className="border p-2 rounded"
                    >
                      {DB_NAMES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setView("db")}
                      className="px-4 py-2 rounded border"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-semibold">About</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    This is a single-file demo payroll system using
                    localStorage. Use Admin to create users and assign DB
                    access. Exports are CSV and browser Print (use Save as PDF).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && view === "admin-users" && isAdmin && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">User Management</h2>
            <UserList users={users} onDelete={handleDeleteUser} />
            <div className="mt-4">
              <h3 className="font-semibold">Create user</h3>
              <CreateUserForm onCreate={handleCreateUser} />
            </div>
          </div>
        )}

        {user && view === "db" && (
          <div className="bg-white p-4 rounded shadow mt-4" ref={printableRef}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">DB: {selectedDB}</h2>
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
                <button
                  onClick={() => handleExportCsv(records)}
                  className="px-3 py-1 border rounded"
                >
                  Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 border rounded"
                >
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
                onDelete={handleDeleteRecord}
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
                    onAdd={handleAddRecord}
                    onEdit={handleEditRecord}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-gray-500 p-4">
        401 Payroll • Data stored in browser localStorage
      </footer>
    </div>
  );
}

// --- Components below (all in one file) ---

function Header({ user, onLogout, onNavigate }) {
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold">401 SF Bde Payroll Manager</h1>
        <p className="text-sm text-gray-500">
          LocalStorage • Single-file example
        </p>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-gray-700">
              Signed in as <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-3 py-1 border rounded"
            >
              Dashboard
            </button>
            {user.role === "admin" && (
              <button
                onClick={() => onNavigate("admin-users")}
                className="px-3 py-1 border rounded"
              >
                Admin
              </button>
            )}
            <button onClick={onLogout} className="px-3 py-1 border rounded">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate("login")}
            className="px-3 py-1 border rounded"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

function LoginCard({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Login</h2>
      <div className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full border p-2 rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onLogin(username, password)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Login
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Default admin: admin / admin</p>
    </div>
  );
}

function UserList({ users, onDelete }) {
  return (
    <div className="mt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Allowed DBs</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{(u.allowedDBs || []).join(", ")}</td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Edit user not implemented in demo")}
                    className="px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(u.id)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CreateUserForm({ onCreate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [allowedDBs, setAllowedDBs] = useState([]);

  const toggleDb = (db) =>
    setAllowedDBs((s) =>
      s.includes(db) ? s.filter((x) => x !== db) : [...s, db]
    );

  const submit = (e) => {
    e.preventDefault();
    if (!username || !password) return alert("username & password required");
    onCreate({ username, password, role, allowedDBs });
    setUsername("");
    setPassword("");
    setRole("user");
    setAllowedDBs([]);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        className="border p-2 rounded"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        className="border p-2 rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="border p-2 rounded">
        <div className="text-sm font-medium mb-1">Allowed DBs</div>
        <div className="grid grid-cols-2 gap-1">
          {DB_NAMES.map((d) => (
            <label key={d} className="text-sm">
              <input
                type="checkbox"
                checked={allowedDBs.includes(d)}
                onChange={() => toggleDb(d)}
              />{" "}
              <span className="ml-2">{d}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create user
        </button>
      </div>
    </form>
  );
}

function EmployeeTable({ records, onEdit, onDelete }) {
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

function EmployeeForm({
  mode = "add",
  initialData = null,
  onCancel,
  onAdd,
  onEdit,
}) {
  const [state, setState] = useState(() => ({
    armyNumber: "",
    rank: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    bankName: "",
    accountNumber: "",
    subSector: "",
    location: "",
    remark: "",
  }));

  useEffect(() => {
    if (initialData) setState(initialData);
  }, [initialData]);

  const set = (k, v) => setState((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    // basic validation
    if (
      !state.armyNumber ||
      !state.rank ||
      !state.firstName ||
      !state.lastName ||
      !state.phoneNumber ||
      !state.bankName ||
      !state.accountNumber ||
      !state.subSector
    ) {
      return alert("Please fill required fields");
    }
    if (mode === "add") onAdd(state);
    else onEdit(state.id, state);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <input
        value={state.armyNumber}
        onChange={(e) => set("armyNumber", e.target.value)}
        placeholder="Army Number *"
        className="border p-2 rounded"
      />
      <select
        value={state.rank}
        onChange={(e) => set("rank", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select rank</option>
        {RANKS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        value={state.firstName}
        onChange={(e) => set("firstName", e.target.value)}
        placeholder="First name *"
        className="border p-2 rounded"
      />
      <input
        value={state.middleName}
        onChange={(e) => set("middleName", e.target.value)}
        placeholder="Middle name"
        className="border p-2 rounded"
      />
      <input
        value={state.lastName}
        onChange={(e) => set("lastName", e.target.value)}
        placeholder="Last name *"
        className="border p-2 rounded"
      />
      <input
        value={state.phoneNumber}
        onChange={(e) => set("phoneNumber", e.target.value)}
        placeholder="Phone number *"
        className="border p-2 rounded"
      />
      <select
        value={state.bankName}
        onChange={(e) => set("bankName", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select bank *</option>
        {BANKS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <input
        value={state.accountNumber}
        onChange={(e) => set("accountNumber", e.target.value)}
        placeholder="Account number *"
        className="border p-2 rounded"
      />

      <select
        value={state.subSector}
        onChange={(e) => set("subSector", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Sub-Sector *</option>
        {SUBSECT.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        value={state.location}
        onChange={(e) => set("location", e.target.value)}
        placeholder="Location (optional)"
        className="border p-2 rounded"
      />
      <input
        value={state.remark}
        onChange={(e) => set("remark", e.target.value)}
        placeholder="Remark (optional)"
        className="border p-2 rounded"
      />

      <div className="md:col-span-2 flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {mode === "add" ? "Add" : "Update"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
