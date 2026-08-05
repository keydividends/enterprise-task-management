import React, { useState, useEffect } from "react";
import { usePermissions } from "../hooks/useRoles";
import "../styles/PermissionMatrix.css";

const PermissionMatrix = ({ roleId, selectedPermissionIds, onPermissionChange }) => {
  const { permissions, fetchPermissions } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState(
    selectedPermissionIds || []
  );

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    setSelectedPermissions(selectedPermissionIds || []);
  }, [selectedPermissionIds]);

  const handlePermissionToggle = (permissionId) => {
    const updatedPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(updatedPermissions);
    if (onPermissionChange) {
      onPermissionChange(updatedPermissions);
    }
  };

  // Group permissions by module and category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const moduleKey = permission.module;
    if (!acc[moduleKey]) {
      acc[moduleKey] = {};
    }
    if (!acc[moduleKey][permission.category]) {
      acc[moduleKey][permission.category] = [];
    }
    acc[moduleKey][permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="permission-matrix">
      <div className="matrix-header">
        <h3>Permission Matrix</h3>
        <p>Select permissions to assign to this role</p>
      </div>

      <div className="matrix-content">
        {Object.entries(groupedPermissions).map(([module, categories]) => (
          <div key={module} className="module-section">
            <div className="module-header">
              <h4>{module}</h4>
            </div>

            <div className="categories-grid">
              {Object.entries(categories).map(([category, perms]) => (
                <div key={`${module}-${category}`} className="category-group">
                  <h5 className="category-title">{category}</h5>
                  <div className="permissions-list">
                    {perms.map((permission) => (
                      <div
                        key={permission._id}
                        className={`permission-item ${
                          selectedPermissions.includes(permission._id)
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`perm-${permission._id}`}
                          checked={selectedPermissions.includes(permission._id)}
                          onChange={() => handlePermissionToggle(permission._id)}
                        />
                        <label htmlFor={`perm-${permission._id}`}>
                          <span className="key">{permission.key}</span>
                          {permission.description && (
                            <span className="desc">{permission.description}</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="matrix-stats">
        <span>
          {selectedPermissions.length} of {permissions.length} permissions
          selected
        </span>
      </div>
    </div>
  );
};

export default PermissionMatrix;
