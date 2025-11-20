import { CreateUserData, Record } from "../interfaces";
import api from "./base.service";

export const getUsers = async () => {
  return await api.get("/users");
};

export const createUser = async (data: CreateUserData) => {
  return await api.post("/users", data);
};

export const deleteUser = async (id: string) => {
  return await api.delete(`/users/${id}`);
};

export const getRecords = async (db: string) => {
  return await api.get(`/records/${db}`);
};

export const createRecord = async (db: string, record: Partial<Record>) => {
  return await api.post(`/records/${db}`, record);
};

export const updateRecord = async (
  db: string,
  id: string,
  record: Partial<Record>
) => {
  return await api.put(`/records/${db}/${id}`, record);
};

export const deleteRecord = async (db: string, id: string): Promise<void> => {
  return await api.delete(`/records/${db}/${id}`);
};

export const exportRecords = async (db: string) => {
  const res = await api.put(`/records/${db}/export`);
  return res;
};
