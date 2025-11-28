import { Personnel } from "../interfaces";
import api from "./base.service";

export const getUsers = async () => {
  return await api.get("/users");
};

export const getPersonnels = async (id: string) => {
  const res = await api.get(`/personnels/db/${id}`);
  return res.data.data;
};

export const createPersonnel = async (
  personnel: Partial<Personnel> & { db_id: string }
) => {
  return await api.post(`/personnels/`, personnel);
};

export const editPersonnel = async (
  id: string,
  personnel: Partial<Personnel>
) => {
  return await api.patch(`/personnels/${id}`, personnel);
};

export const deletePersonnel = async (id: string): Promise<void> => {
  return await api.delete(`/personnels/${id}`);
};

export const exportRecords = async (db: string) => {
  const res = await api.put(`/records/${db}/export`);
  return res;
};
