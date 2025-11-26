export interface User {
  army_number: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  allowed_dbs: string[];
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

export interface LoginCredentials {
  army_number: string;
  password: string;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  army_number: string;
  password: string;
  role: "admin" | "user";
  allowed_dbs: string[];
}

export type ViewType = "login" | "dashboard" | "admin-users" | "db";
