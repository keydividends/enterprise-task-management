import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit3, Power, Trash2, Shield, AlertTriangle, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  const canCreate = currentUser?.permissions?.includes('USER_CREATE') || currentUser?.role === 'ADMIN';
  const canEdit = currentUser?.permissions?.includes('USER_UPDATE') || currentUser?.role === 'ADMIN';
  const canDelete = currentUser?.permissions?.includes('USER_DELETE') || currentUser?.role === 'ADMIN';

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
    <div className="user-list-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>Employee Management</h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
            Manage employee accounts, system roles, permissions, and profile statuses.
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
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Plus size={18} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <label htmlFor="user-search-input" className="sr-only" style={{ display: 'none' }}>
            Search Employees
          </label>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search by name, email, Employee ID, department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search employees by name, email, Employee ID, or department"
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="status-filter-select" style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>
            Status:
          </label>
          <Filter size={16} style={{ opacity: 0.6 }} />
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter employees by account status"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
      </div>

      {/* Error UI with Retry Button */}
      {error && (
        <div
          role="alert"
          className="glass-card"
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} />
            <div>
              <strong style={{ fontSize: '15px' }}>Unable to fetch employees.</strong>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{error}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            aria-label="Retry loading employees"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="glass-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.03)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Employee</th>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Employee ID</th>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Role</th>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Department</th>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Status</th>
              <th scope="col" style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                    <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>Loading Employees...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Search size={28} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>No employees found</h3>
                    <p style={{ margin: 0, opacity: 0.6, fontSize: '14px' }}>
                      {searchInput || statusFilter ? 'Try clearing your search or status filters.' : 'Create your first employee.'}
                    </p>
                    {canCreate && (
                      <button
                        type="button"
                        onClick={() => navigate('/users/create')}
                        aria-label="Create your first employee"
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={16} /> Create Employee
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const targetId = user.id || user.customId;
                const displayEmployeeId = user.customId || user.user_id || user.employeeId || 'EMP-000';

                return (
                  <tr
                    key={targetId}
                    style={{
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          aria-hidden="true"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '16px',
                          }}
                        >
                          {user.firstName?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>
                            {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.6 }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>
                      {displayEmployeeId}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                        <Shield size={14} style={{ opacity: 0.7 }} />
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                      {user.department || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          title="View Details"
                          aria-label={`View details for employee ${user.fullName || user.email}`}
                          onClick={() => navigate(`/users/${targetId}`)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            background: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {canEdit && (
                          <button
                            type="button"
                            title="Edit Employee"
                            aria-label={`Edit employee ${user.fullName || user.email}`}
                            onClick={() => navigate(`/users/${targetId}/edit`)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              background: 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            title={user.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                            aria-label={`${user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} employee ${user.fullName || user.email}`}
                            onClick={() => handleToggleStatus(targetId, user.status)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              background: 'transparent',
                              color: user.status === 'ACTIVE' ? '#f59e0b' : '#10b981',
                              cursor: 'pointer',
                            }}
                          >
                            <Power size={16} />
                          </button>
                        )}

                        {canDelete && user.role !== 'ADMIN' && (
                          <button
                            type="button"
                            title="Delete Employee"
                            aria-label={`Delete employee ${user.fullName || user.email}`}
                            onClick={() => handleDelete(targetId)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={16} />
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

        {/* Pagination Controls */}
        {!loading && users.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.7 }}>
              Showing Page {pagination.page} of {pagination.totalPages || 1} ({pagination.totalItems} total employees)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                aria-label="Go to previous page"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  background: 'transparent',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: Math.min(pagination.totalPages || 1, 5) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === pagination.page ? 'page' : undefined}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: pageNum === pagination.page ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                    background: pageNum === pagination.page ? 'linear-gradient(135deg, #4f46e5, #06b6d4)' : 'transparent',
                    color: pageNum === pagination.page ? '#ffffff' : 'inherit',
                    fontWeight: pageNum === pagination.page ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '13px',
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
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  background: 'transparent',
                  cursor: pagination.page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= (pagination.totalPages || 1) ? 0.5 : 1,
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
