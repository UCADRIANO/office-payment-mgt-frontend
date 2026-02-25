import { Personnel, PaginatedResponse } from "../interfaces";
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

export const getPersonnels = async (
  id: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
  filter: string = "",
): Promise<PaginatedResponse<Personnel>> => {
  const res = await api.get(`/personnels/db/${id}`, {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(filter ? { filter } : {}),
    },
  });
  return res.data.data;
};

export const createPersonnel = async (
  personnel: Partial<Personnel> & { db_id: string },
) => {
  return await api.post(`/personnels/`, personnel);
};

export const createBulkPersonnel = async (
  data: (Partial<Personnel> & { db_id: string })[],
) => {
  return await api.post(`/personnels/upload`, data);
};

export const editPersonnel = async (
  id: string,
  personnel: Partial<Personnel>,
) => {
  return await api.patch(`/personnels/${id}`, personnel);
};

export const deletePersonnel = async (id: string) => {
  return await api.delete(`/personnels/${id}`);
};

export const bulkDeletePersonnels = async (personnelIds: string[]) => {
  return await api.delete("/personnels/bulk-delete", {
    data: {
      personnels_id: personnelIds,
    },
  });
};

export interface PersonnelAnalytics {
  total_active_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_inactive_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_awol_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_cse_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_death_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_deleted_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_posted_personnel: {
    percentage_increase: number;
    total: number;
  };
  total_rtu_personnel: {
    percentage_increase: number;
    total: number;
  };
}

export const getPersonnelAnalytics = async (dbId: string) => {
  const res = await api.get(`/analytics/personnels/db/${dbId}`);
  return res.data.data as PersonnelAnalytics;
};
