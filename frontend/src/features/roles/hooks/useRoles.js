import { useState, useEffect } from "react";
import roleService from "../services/roleService";

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchRoles = async (page = 1, pageSize = 20, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.listRoles(page, pageSize, filters);
      setRoles(response.data || []);
      setPagination(response.pagination || {});
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch roles");
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleById = async (roleId) => {
    try {
      setError(null);
      const response = await roleService.getRoleById(roleId);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch role details");
      throw err;
    }
  };

  const createRole = async (roleData) => {
    try {
      setError(null);
      const response = await roleService.createRole(roleData);
      setRoles((prev) => [response.data, ...prev]);
      return response;
    } catch (err) {
      setError(err.message || "Failed to create role");
      throw err;
    }
  };

  const updateRole = async (roleId, roleData) => {
    try {
      setError(null);
      const response = await roleService.updateRole(roleId, roleData);
      setRoles((prev) =>
        prev.map((role) => (role._id === roleId ? response.data : role))
      );
      return response;
    } catch (err) {
      setError(err.message || "Failed to update role");
      throw err;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      setError(null);
      await roleService.deleteRole(roleId);
      setRoles((prev) => prev.filter((role) => role._id !== roleId));
    } catch (err) {
      setError(err.message || "Failed to delete role");
      throw err;
    }
  };

  return {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPermissions = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.listPermissions(1, 100, filters);
      setPermissions(response.data || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch permissions");
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
  };
};

export const useRolePermissions = (roleId) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRolePermissions = async () => {
    if (!roleId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.getRolePermissions(roleId);
      setPermissions(response.data || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch role permissions");
      console.error("Error fetching role permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (permissionIds) => {
    try {
      setError(null);
      const response = await roleService.updateRolePermissions(
        roleId,
        permissionIds
      );
      setPermissions(response.data?.permissions || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to update role permissions");
      throw err;
    }
  };

  useEffect(() => {
    fetchRolePermissions();
  }, [roleId]);

  return {
    permissions,
    loading,
    error,
    updatePermissions,
    refetch: fetchRolePermissions,
  };
};
