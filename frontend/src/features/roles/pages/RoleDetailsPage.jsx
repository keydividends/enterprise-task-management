import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoles, useRolePermissions } from "../hooks/useRoles";
import PermissionGate from "../components/PermissionGate";
import PermissionMatrix from "../components/PermissionMatrix";
import "../styles/RoleDetailsPage.css";

const RoleDetailsPage = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const { getRoleById } = useRoles();
  const { permissions, updatePermissions } = useRolePermissions(roleId);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRoleById(roleId);
        setRole(response.data);
      } catch (err) {
        setError(err.message || "Failed to load role");
        console.error("Error loading role:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  const handleEditRole = () => {
    navigate(`/roles/${roleId}/edit`);
  };

  const handleUpdatePermissions = async (permissionIds) => {
    try {
      setError(null);
      await updatePermissions(permissionIds);
      alert("Role permissions updated successfully");
      setShowPermissionMatrix(false);
      // Refresh role data
      const response = await getRoleById(roleId);
      setRole(response.data);
    } catch (err) {
      alert(`Failed to update permissions: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="role-details-page"><p>Loading role...</p></div>;
  }

  if (error) {
    return <div className="role-details-page"><div className="error-message">{error}</div></div>;
  }

  if (!role) {
    return <div className="role-details-page"><p>Role not found</p></div>;
  }

  return (
    <div className="role-details-page">
      <div className="page-header">
        <div className="title-section">
          <h1>{role.name}</h1>
          <span className={`badge ${role.isSystem ? "system" : "custom"}`}>
            {role.isSystem ? "System Role" : "Custom Role"}
          </span>
        </div>
        <div className="actions">
          <PermissionGate adminOnly permission="ROLE_UPDATE">
            <button
              className="btn-primary"
              onClick={handleEditRole}
              disabled={role.isSystem && role.name !== "USER"}
              title={role.isSystem && role.name !== "USER" ? "Cannot edit system role" : "Edit"}
            >
              Edit Role
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="details-container">
        <div className="details-card">
          <h3>Role Information</h3>
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{role.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Description:</span>
            <span className="value">{role.description || "-"}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`badge ${role.isActive ? "active" : "inactive"}`}>
              {role.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Created:</span>
            <span className="value">
              {new Date(role.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Last Updated:</span>
            <span className="value">
              {new Date(role.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="permissions-card">
          <div className="card-header">
            <h3>Permissions ({permissions.length})</h3>
            <PermissionGate adminOnly permission="ROLE_MANAGE">
              <button
                className="btn-small btn-info"
                onClick={() => setShowPermissionMatrix(!showPermissionMatrix)}
                disabled={role.isSystem}
              >
                {showPermissionMatrix ? "Hide Matrix" : "Manage Permissions"}
              </button>
            </PermissionGate>
          </div>

          {showPermissionMatrix && (
            <div className="permission-matrix-section">
              <PermissionMatrix
                roleId={roleId}
                selectedPermissionIds={permissions.map((p) => p._id || p.id)}
                onPermissionChange={handleUpdatePermissions}
              />
            </div>
          )}

          {!showPermissionMatrix && (
            <div className="permissions-list">
              {permissions.length === 0 ? (
                <p className="empty-message">No permissions assigned</p>
              ) : (
                <div className="permissions-grid">
                  {permissions.map((permission) => (
                    <div key={permission._id} className="permission-badge">
                      <span className="key">{permission.key}</span>
                      <span className="category">{permission.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="page-actions">
        <button className="btn-secondary" onClick={() => navigate("/roles")}>
          Back to Roles
        </button>
      </div>
    </div>
  );
};

export default RoleDetailsPage;
