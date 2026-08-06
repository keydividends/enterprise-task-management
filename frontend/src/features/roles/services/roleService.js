import axiosClient from "../../../api/axiosClient";

const roleService = {
  // Role API calls
  listRoles: async (page = 1, pageSize = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        ...filters,
      });
      const response = await axiosClient.get(`/roles?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await axiosClient.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRole: async (roleData) => {
    try {
      const response = await axiosClient.post("/roles", roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await axiosClient.patch(
        `/roles/${roleId}`,
        roleData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await axiosClient.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Permission API calls
  listPermissions: async (page = 1, pageSize = 50, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        ...filters,
      });
      const response = await axiosClient.get(`/permissions?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRolePermissions: async (roleId) => {
    try {
      const response = await axiosClient.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await axiosClient.put(
        `/roles/${roleId}/permissions`,
        { permissionIds }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default roleService;
