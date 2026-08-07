import React, { useState, useEffect } from "react";
import { usePermissions } from "../hooks/useRoles";
import "../styles/RoleForm.css";

const RoleForm = ({ role, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [],
  });
  const [errors, setErrors] = useState({});
  const { permissions, fetchPermissions } = usePermissions();

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        description: role.description || "",
        permissionIds: role.permissions?.map((p) => p._id || p.id) || [],
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }
    if (formData.name.trim().length < 3) {
      newErrors.name = "Role name must be at least 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="role-form">
      <div className="form-group">
        <label htmlFor="name">Role Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Developer, Manager"
          disabled={role?.isSystem && role?.name !== "USER"}
          className={errors.name ? "input-error" : ""}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter role description"
          rows="3"
          disabled={role?.isSystem && role?.name !== "USER"}
        />
      </div>

      <div className="form-group">
        <label>Permissions</label>
        {role?.isSystem && role?.name !== "USER" && (
          <p className="info-message">
            System roles have fixed permissions and cannot be modified.
          </p>
        )}
        <div className="permissions-grid">
          {Object.entries(permissionsByModule).map(([module, modulePerms]) => (
            <div key={module} className="permission-module">
              <h4>{module}</h4>
              {modulePerms.map((permission) => (
                <div key={permission._id} className="permission-checkbox">
                  <input
                    type="checkbox"
                    id={`permission-${permission._id}`}
                    checked={formData.permissionIds.includes(permission._id)}
                    onChange={() => handlePermissionChange(permission._id)}
                    disabled={role?.isSystem && role?.name !== "USER"}
                  />
                  <label htmlFor={`permission-${permission._id}`}>
                    <span className="permission-key">{permission.key}</span>
                    <span className="permission-description">
                      {permission.description}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={loading || (role?.isSystem && role?.name !== "USER")}
          className="btn-primary"
        >
          {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
