import { CreateUserData } from "../interfaces";
import api from "./base.service";

export const createUser = async (data: CreateUserData) => {
  return await api.post("/admin/users", data);
};

export const editUser = async (data: Partial<CreateUserData>) => {
  return await api.put("/admin/users", data);
};

export const deleteUser = async (id: string) => {
  return await api.delete(`/users/${id}`);
};
