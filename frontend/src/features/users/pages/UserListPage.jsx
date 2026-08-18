import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit3, Power, Trash2, Shield, AlertTriangle, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, X, UserCheck } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { useAuth } from '../../auth/hooks/useAuth';

export const UserListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const {
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
    toggleUserStatus,
    removeUser,
  } = useUsers();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [toastMessage, setToastMessage] = useState(null);

  // 300ms Search Debouncing Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, setSearchQuery]);

  // Check query params for toasts
  useEffect(() => {
    const toastType = searchParams.get('toast');
    if (toastType === 'created') {
      setToastMessage('Employee Created Successfully');
      searchParams.delete('toast');
      setSearchParams(searchParams, { replace: true });
    } else if (toastType === 'updated') {
      setToastMessage('Employee Updated Successfully');
      searchParams.delete('toast');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Role permissions: Admins and Managers get full management actions
  const isAdminOrManager = !currentUser || currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const canCreate = isAdminOrManager || currentUser?.permissions?.includes('USER_CREATE');
  const canEdit = isAdminOrManager || currentUser?.permissions?.includes('USER_UPDATE');
  const canDelete = isAdminOrManager || currentUser?.permissions?.includes('USER_DELETE');

  // Filter employees based on role and exclude self
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.filter((u) => {
      // Exclude self from employees table
      const isSelf = (
        (currentUser?.id && u.id === currentUser.id) ||
        (currentUser?.employeeId && u.employeeId === currentUser.employeeId) ||
        (currentUser?.email && u.email?.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (isSelf) return false;

      // Admins & Managers see employees created/managed by them or general staff
      if (isAdminOrManager) {
        if (currentUser?.role === 'MANAGER') {
          return (
            u.managerEmployeeId === currentUser?.employeeId ||
            u.createdBy === currentUser?.id ||
            u.role === 'USER'
          );
        }
        return true; // Admin sees all employees (excluding self)
      }

      // Employees see their coworkers in same department or general coworkers
      if (currentUser?.department && u.department) {
        return u.department.toLowerCase() === currentUser.department.toLowerCase();
      }
      return true;
    });
  }, [users, currentUser, isAdminOrManager]);

  // Confirmation Dialogs before Activate / Deactivate
  const handleToggleStatus = async (userId, currentStatus) => {
    const actionText = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate';
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this employee?`);
    if (!confirmed) return;

    try {
      await toggleUserStatus(userId, currentStatus);
      setToastMessage('Status Updated');
    } catch (err) {
      alert(err.message || 'Failed to update employee status.');
    }
  };

  // Confirmation Dialog before Delete
  const handleDelete = async (userId) => {
    const confirmed = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;

    try {
      await removeUser(userId);
      setToastMessage('Employee Deleted Successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete employee.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="user-list-page" style={{ padding: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {isAdminOrManager ? 'Employee Management' : 'Team Coworkers'}
          </h1>
          <p style={{ margin: '3px 0 0 0', opacity: 0.7, fontSize: '13px' }}>
            {isAdminOrManager
              ? 'Manage employee accounts, assign project IDs, set associate manager IDs, and roles.'
              : 'View team members and coworkers in your organization.'}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            aria-label="Add new employee"
            onClick={() => navigate('/users/create')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Plus size={16} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '16px',
          boxShadow: '0 3px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <label htmlFor="user-search-input" className="sr-only" style={{ display: 'none' }}>
            Search Employees
          </label>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search by name, email, Employee ID, Manager ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search employees by name, email, Employee ID, Manager ID, or department"
            style={{
              width: '100%',
              padding: '8px 10px 8px 34px',
              borderRadius: '7px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
              boxSizing: 'border-box',
              fontSize: '13px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="status-filter-select" style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>
            Status:
          </label>
          <Filter size={15} style={{ opacity: 0.6 }} />
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter employees by account status"
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
              fontSize: '13px',
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
      </div>

      {/* Error UI */}
      {error && (
        <div
          role="alert"
          className="glass-card"
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <div>
              <strong style={{ fontSize: '13px' }}>Unable to fetch employees.</strong>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{error}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            aria-label="Retry loading employees"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Optimized Table Layout with Generous 20% Actions Column */}
      <div className="glass-card" style={{ borderRadius: '10px', overflow: 'hidden', width: '100%', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(79, 70, 229, 0.04)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              <th scope="col" style={{ width: '22%', padding: '12px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Employee</th>
              <th scope="col" style={{ width: '12%', padding: '12px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Employee ID</th>
              <th scope="col" style={{ width: '15%', padding: '12px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Associate Manager ID</th>
              <th scope="col" style={{ width: '12%', padding: '12px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Department</th>
              <th scope="col" style={{ width: '10%', padding: '12px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Role</th>
              <th scope="col" style={{ width: '9%', padding: '12px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8 }}>Status</th>
              <th scope="col" style={{ width: '20%', padding: '12px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.8, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: 0.7 }}>
                    <RefreshCw size={22} className="spin" style={{ animation: 'spin 1s linear infinite', color: '#4f46e5' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Loading Employees...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Search size={22} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>No employees found</h3>
                    <p style={{ margin: 0, opacity: 0.6, fontSize: '12px' }}>
                      {searchInput || statusFilter ? 'Try clearing your search or status filters.' : 'No other employees found.'}
                    </p>
                    {canCreate && (
                      <button
                        type="button"
                        onClick={() => navigate('/users/create')}
                        aria-label="Create your first employee"
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <Plus size={14} /> Create Employee
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const targetId = user.id || user.employeeId;
                const displayEmployeeId = user.employeeId || 'EMP-000';
                const rawManagerId = user.managerEmployeeId || user.managerId;
                const displayManagerId = rawManagerId && String(rawManagerId).trim() ? String(rawManagerId).trim() : 'Not Assigned';

                return (
                  <tr
                    key={targetId}
                    style={{
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <div
                          aria-hidden="true"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {user.firstName?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                          </div>
                          <div style={{ fontSize: '11px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID Tag */}
                    <td style={{ padding: '10px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(79, 70, 229, 0.1)',
                          color: '#4f46e5',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {displayEmployeeId}
                      </span>
                    </td>

                    {/* Associate Manager ID Tag */}
                    <td style={{ padding: '10px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: displayManagerId === 'Not Assigned' ? 'rgba(100, 116, 139, 0.08)' : 'rgba(6, 182, 212, 0.12)',
                          color: displayManagerId === 'Not Assigned' ? '#64748b' : '#0891b2',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          fontWeight: displayManagerId === 'Not Assigned' ? 500 : 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        <UserCheck size={11} style={{ opacity: 0.7, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayManagerId}</span>
                      </span>
                    </td>

                    <td style={{ padding: '10px 10px', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.department || 'Unassigned'}
                    </td>

                    <td style={{ padding: '10px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                        <Shield size={12} style={{ opacity: 0.7 }} />
                        {user.role}
                      </span>
                    </td>

                    <td style={{ padding: '10px 10px' }}>
                      <UserStatusBadge status={user.status} />
                    </td>

                    {/* 100% Fully Visible Action Buttons with Generous Padding */}
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {/* 1. Eye (View Details) */}
                        <button
                          type="button"
                          title="View Details"
                          aria-label={`View details for employee ${user.fullName || user.email}`}
                          onClick={() => navigate(`/users/${targetId}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid rgba(79, 70, 229, 0.2)',
                            background: 'rgba(79, 70, 229, 0.08)',
                            color: '#4f46e5',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        {/* 2. Edit (Edit Profile) */}
                        {canEdit && (
                          <button
                            type="button"
                            title="Edit Employee"
                            aria-label={`Edit employee ${user.fullName || user.email}`}
                            onClick={() => navigate(`/users/${targetId}/edit`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                              background: 'rgba(6, 182, 212, 0.08)',
                              color: '#0891b2',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}

                        {/* 3. Power (Activate / Deactivate Status) */}
                        {canEdit && (
                          <button
                            type="button"
                            title={user.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                            aria-label={`${user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} employee ${user.fullName || user.email}`}
                            onClick={() => handleToggleStatus(targetId, user.status)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: user.status === 'ACTIVE' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                              background: user.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: user.status === 'ACTIVE' ? '#d97706' : '#059669',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Power size={14} />
                          </button>
                        )}

                        {/* 4. Trash2 (Delete) - 100% Fully Visible */}
                        {canDelete && (
                          <button
                            type="button"
                            title="Delete Employee"
                            aria-label={`Delete employee ${user.fullName || user.email}`}
                            onClick={() => handleDelete(targetId)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredUsers.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Showing {filteredUsers.length} employee records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              type="button"
              aria-label="Go to previous page"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'transparent',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {Array.from({ length: Math.min(pagination.totalPages || 1, 5) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === pagination.page ? 'page' : undefined}
                onClick={() => handlePageChange(pageNum)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: pageNum === pagination.page ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                  background: pageNum === pagination.page ? 'linear-gradient(135deg, #4f46e5, #06b6d4)' : 'transparent',
                  color: pageNum === pagination.page ? '#ffffff' : 'inherit',
                  fontWeight: pageNum === pagination.page ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              aria-label="Go to next page"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'transparent',
                cursor: pagination.page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= (pagination.totalPages || 1) ? 0.5 : 1,
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
