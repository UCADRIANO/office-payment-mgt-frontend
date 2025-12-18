import {
  CreateDb,
  CreateUserData,
  PaginatedResponse,
  User,
  Db,
} from "../interfaces";
import api from "./base.service";

export const createUser = async (data: CreateUserData) => {
  return await api.post("/admin/users", data);
};

export const editUser = async (id: string, data: Partial<CreateUserData>) => {
  return await api.patch(`/admin/users/${id}`, data);
};

export const deleteUser = async (id: string) => {
  return await api.delete(`/admin/users/${id}`);
};

export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<User>> => {
  const res = await api.get("/admin/users", {
    params: { page, limit },
  });
  return res.data.data;
};

export const getAllDbs = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Db>> => {
  const res = await api.get("/admin/dbs", {
    params: { page, limit },
  });
  return res.data.data;
};

export const createDb = async (data: CreateDb) => {
  return await api.post("/admin/dbs", data);
};

export const editDb = async (id: string, data: Partial<CreateDb>) => {
  return await api.patch(`/admin/dbs/${id}`, data);
};

export const deleteDb = async (id: string) => {
  return await api.delete(`/admin/dbs/${id}`);
};

export interface DashboardAnalytics {
  databases: {
    percentage_increase: number;
    total: number;
  };
  new_personnel: {
    percentage_increase: number;
    total: number;
  };
  personnel: {
    percentage_increase: number;
    total: number;
  };
  users: {
    percentage_increase: number;
    total: number;
  };
}

export const getDashboardAnalytics = async () => {
  const res = await api.get("/analytics/dashboard");
  return res.data.data as DashboardAnalytics;
};
