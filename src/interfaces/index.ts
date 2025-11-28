export interface User {
  army_number: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  allowed_dbs: string[];
  id: string;
}

export interface Personnel {
  id: string;
  army_number: string;
  rank: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone_number: string;
  bank: {
    name: string;
    sort_code: string;
  };
  acct_number: string;
  sub_sector: string;
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
