export interface User {
  army_number: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  allowed_dbs: string[];
  id: string;
}

export interface Record {
  id: string;
  armyNumber: string;
  rank: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  bank: {
    name: string;
    sortCode: string;
  };
  accountNumber: string;
  subSector: string;
  location?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  customRank?: string;
  customSubSector?: string;
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

export interface CreateDb {
  name: string;
  short_code: string;
  description: string;
}

export interface Db {
  id: string;
  name: string;
  description: string;
  short_code: string;
}
