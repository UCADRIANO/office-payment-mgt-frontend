import { CreateDb, CreateUserData } from "../interfaces";
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

export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data.data;
};

export const getAllDbs = async () => {
  const res = await api.get("/admin/dbs");
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
