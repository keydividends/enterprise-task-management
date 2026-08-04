import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit3, Power, Trash2, UserCheck, Shield } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { useAuth } from '../../auth/hooks/useAuth';

export const UserListPage = () => {
  const navigate = useNavigate();
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
    toggleUserStatus,
    removeUser,
  } = useUsers();

  const canCreate = currentUser?.permissions?.includes('USER_CREATE') || currentUser?.role === 'ADMIN';
  const canEdit = currentUser?.permissions?.includes('USER_UPDATE') || currentUser?.role === 'ADMIN';
  const canDelete = currentUser?.permissions?.includes('USER_DELETE') || currentUser?.role === 'ADMIN';

  const handleToggleStatus = async (userId, status) => {
    try {
      await toggleUserStatus(userId, status);
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await removeUser(userId);
      } catch (err) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="user-list-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>User Management</h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
            Manage user accounts, system roles, permissions, and profile statuses.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
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
            <Plus size={18} /> Add New User
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
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Filter size={16} style={{ opacity: 0.6 }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* User Table */}
      <div className="glass-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.03)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>User</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Role</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Department</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Status</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, opacity: 0.8, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', opacity: 0.6 }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', opacity: 0.6 }}>
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid var(--border-color, #f1f5f9)',
                    transition: 'background 0.2s',
                  }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
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
                        {user.firstName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>
                          {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.6 }}>{user.email}</div>
                      </div>
                    </div>
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
                        onClick={() => navigate(`/users/${user.id}`)}
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
                          title="Edit User"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
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
                          title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          onClick={() => handleToggleStatus(user.id, user.status)}
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
                          title="Delete User"
                          onClick={() => handleDelete(user.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;
