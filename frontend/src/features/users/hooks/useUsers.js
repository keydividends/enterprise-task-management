import { useCallback, useEffect, useState } from 'react';
import userService from '../services/userService';

// Helper function to ensure every user has an Employee ID.
const getEmployeeEmployeeId = (u) => {
  if (u.employeeId) return u.employeeId;
  if (u.email) return `EMP-${u.email.split('@')[0]}`;
  const rawId = String(u.id || u._id || '001');
  return `EMP-${rawId.slice(-4)}`;
};

const normalizeUserObj = (u) => {
  const employeeId = getEmployeeEmployeeId(u);
  const managerEmployeeId =
    u.managerEmployeeId !== undefined && u.managerEmployeeId !== null
      ? u.managerEmployeeId
      : '';

  return {
    ...u,
    employeeId: employeeId,
    managerEmployeeId,
  };
};

// Fallback seed data for local frontend state when API is offline or initial render
const INITIAL_MOCK_USERS = [
  {
    id: 'user_admin_1',
    employeeId: 'ADMIN-001',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin Employee',
    email: 'admin@etms.com',
    role: 'ADMIN',
    department: 'Management',
    title: 'System Administrator',
    status: 'ACTIVE',
    managerEmployeeId: '',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'user_mgr_1',
    employeeId: 'MGR-001',
    firstName: 'Sarah',
    lastName: 'Manager',
    fullName: 'Sarah Manager',
    email: 'manager@etms.com',
    role: 'MANAGER',
    department: 'Engineering',
    title: 'Engineering Manager',
    status: 'ACTIVE',
    managerEmployeeId: 'ADMIN-001',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'user_demo_1',
    employeeId: 'EMP-001',
    firstName: 'Demo',
    lastName: 'Employee',
    fullName: 'Demo Employee',
    email: 'demo@etms.com',
    role: 'USER',
    department: 'Engineering',
    title: 'Software Engineer',
    status: 'ACTIVE',
    managerEmployeeId: 'MGR-001',
    createdAt: '2026-02-01T10:30:00.000Z',
  },
  {
    id: 'user_disabled_1',
    employeeId: 'EMP-002',
    firstName: 'Disabled',
    lastName: 'Employee',
    fullName: 'Disabled Employee',
    email: 'disabled@etms.com',
    role: 'USER',
    department: 'QA',
    title: 'Tester',
    status: 'DISABLED',
    managerEmployeeId: 'MGR-001',
    createdAt: '2026-02-10T14:15:00.000Z',
  },
].map(normalizeUserObj);

export const useUsers = (initialParams = {}) => {
  const [users, setUsers] = useState(INITIAL_MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.status || '');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: INITIAL_MOCK_USERS.length,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchQuery,
        status: statusFilter || undefined,
      });

      if (res && res.success && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeUserObj);
        setUsers(normalized);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.warn('Backend API request failed, using active state:', err.message);
      let filtered = [...INITIAL_MOCK_USERS];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q) ||
            (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
            (u.managerEmployeeId && u.managerEmployeeId.toLowerCase().includes(q))
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }
      setUsers(filtered.map(normalizeUserObj));
      setPagination((prev) => ({ ...prev, totalItems: filtered.length }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (userData) => {
    setLoading(true);
    try {
      const res = await userService.createUser(userData);
      const rawUser = (res && res.data) ? res.data : { ...userData, id: `user_${Date.now()}`, status: 'ACTIVE' };
      const newUser = normalizeUserObj(rawUser);
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      console.warn('API error during createUser, applying local creation state:', err.message);
      const fallbackUser = normalizeUserObj({
        ...userData,
        id: `user_${Date.now()}`,
        status: 'ACTIVE',
      });
      setUsers((prev) => [fallbackUser, ...prev]);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (userId, updateData) => {
    setLoading(true);
    try {
      const res = await userService.updateUser(userId, updateData);
      const updated = normalizeUserObj(res.data || updateData);
      setUsers((prev) => prev.map((u) => ((u.id === userId || u.employeeId === userId) ? { ...u, ...updated } : u)));
      return updated;
    } catch (err) {
      console.warn('API error during updateUser, applying local edit state:', err.message);
      const updatedLocally = normalizeUserObj(updateData);
      setUsers((prev) => prev.map((u) => ((u.id === userId || u.employeeId === userId) ? { ...u, ...updatedLocally } : u)));
      return updatedLocally;
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setLoading(true);
    try {
      if (nextStatus === 'DISABLED') {
        await userService.deactivateUser(userId);
      } else {
        await userService.activateUser(userId);
      }
      setUsers((prev) => prev.map((u) => ((u.id === userId || u.employeeId === userId) ? { ...u, status: nextStatus } : u)));
    } catch (err) {
      setUsers((prev) => prev.map((u) => ((u.id === userId || u.employeeId === userId) ? { ...u, status: nextStatus } : u)));
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId && u.employeeId !== userId));
    } catch (err) {
      setUsers((prev) => prev.filter((u) => u.id !== userId && u.employeeId !== userId));
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    pagination,
    setPagination,
    fetchUsers,
    addUser,
    editUser,
    toggleUserStatus,
    removeUser,
  };
};

export default useUsers;
