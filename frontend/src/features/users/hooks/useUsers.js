import { useCallback, useEffect, useState } from 'react';
import userService from '../services/userService';

// Fallback seed data for local frontend state when API is offline or initial render
const INITIAL_MOCK_USERS = [
  {
    id: 'user_admin_1',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    email: 'admin@etms.com',
    role: 'ADMIN',
    department: 'Management',
    title: 'System Administrator',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'user_demo_1',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    email: 'demo@etms.com',
    role: 'USER',
    department: 'Engineering',
    title: 'Software Engineer',
    status: 'ACTIVE',
    createdAt: '2026-02-01T10:30:00.000Z',
  },
  {
    id: 'user_disabled_1',
    firstName: 'Disabled',
    lastName: 'User',
    fullName: 'Disabled User',
    email: 'disabled@etms.com',
    role: 'USER',
    department: 'QA',
    title: 'Tester',
    status: 'DISABLED',
    createdAt: '2026-02-10T14:15:00.000Z',
  },
];

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
        setUsers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.warn('Backend API request failed, using active state:', err.message);
      // Filter mock users in fallback mode
      let filtered = [...INITIAL_MOCK_USERS];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }
      setUsers(filtered);
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
      const newUser = res.data || { ...userData, id: `user_${Date.now()}`, status: 'ACTIVE' };
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (userId, updateData) => {
    setLoading(true);
    try {
      const res = await userService.updateUser(userId, updateData);
      const updated = res.data;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      return updated;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
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
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
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
