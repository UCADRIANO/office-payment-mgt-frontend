import { Personnel } from "../interfaces";
import api from "./base.service";

export const getUsers = async () => {
  return await api.get("/users");
};

export const resetPassword = async (data: {
  user_id: string;
  new_password: string;
}) => {
  return await api.post("/admin/reset-password", data);
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

export const createBulkPersonnel = async (
  data: (Partial<Personnel> & { db_id: string })[]
) => {
  return await api.post(`/personnels/upload`, data);
};

export const editPersonnel = async (
  id: string,
  personnel: Partial<Personnel>
) => {
  return await api.patch(`/personnels/${id}`, personnel);
};

export const deletePersonnel = async (id: string) => {
  return await api.delete(`/personnels/${id}`);
};
