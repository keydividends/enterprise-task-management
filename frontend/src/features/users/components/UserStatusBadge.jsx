import React from 'react';

const statusConfig = {
  ACTIVE: { label: 'Active', className: 'badge-active', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  DISABLED: { label: 'Disabled', className: 'badge-disabled', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  LOCKED: { label: 'Locked', className: 'badge-locked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  DELETED: { label: 'Deleted', className: 'badge-deleted', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' },
};

export const UserStatusBadge = ({ status = 'ACTIVE' }) => {
  const config = statusConfig[status.toUpperCase()] || statusConfig.ACTIVE;

  return (
    <span
      className={`status-badge ${config.className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
};

export default UserStatusBadge;
