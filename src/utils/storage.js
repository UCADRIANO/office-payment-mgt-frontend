// src/utils/storage.js
import { LS_USERS, LS_SESSION, DB_KEY, DB_NAMES } from "../constants";

/**
 * Safe localStorage read/write helpers
 */
function readLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    // If JSON.parse fails or localStorage is unavailable, return null
    return null;
  }
}

function writeLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore write errors (e.g. quota exceeded)
    console.warn("writeLS failed", e);
  }
}

/**
 * User management (exports)
 */
export function getUsers() {
  return readLS(LS_USERS) || [];
}
export function saveUsers(users) {
  writeLS(LS_USERS, users);
}
export function createDefaultAdminIfEmpty() {
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

/**
 * Session helpers
 */
export function readSession() {
  return readLS(LS_SESSION);
}
export function writeSession(u) {
  writeLS(LS_SESSION, u);
}

/**
 * Records (DB) helpers
 */
export function getRecords(db) {
  return readLS(DB_KEY(db)) || [];
}
export function saveRecords(db, records) {
  writeLS(DB_KEY(db), records);
}
export function addRecord(db, record) {
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
export function updateRecord(db, id, changes) {
  const records = getRecords(db).map((r) =>
    r.id === id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r
  );
  saveRecords(db, records);
}
export function deleteRecord(db, id) {
  const records = getRecords(db).filter((r) => r.id !== id);
  saveRecords(db, records);
}

/**
 * CSV helpers
 */
export function toCsv(records) {
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

export function download(filename, content, mime = "text/csv") {
  try {
    const blob = new Blob([content], { type: mime + ";charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn("download failed", e);
  }
}
