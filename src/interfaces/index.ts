export interface User {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "user";
  allowedDBs: string[];
}

export interface Record {
  id: string;
  armyNumber: string;
  rank: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  subSector: string;
  location?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  type: "success" | "error";
  text: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: "admin" | "user";
  allowedDBs: string[];
}

export type ViewType = "login" | "dashboard" | "admin-users" | "db";
