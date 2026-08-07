import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";
import PermissionGate from "../components/PermissionGate";
import "../styles/RoleListPage.css";

const RoleListPage = () => {
  const navigate = useNavigate();
  const {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    deleteRole,
  } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = () => {
    navigate("/roles/create");
  };

  const handleEditRole = (roleId) => {
    navigate(`/roles/${roleId}/edit`);
  };

  const handleViewRole = (roleId) => {
    navigate(`/roles/${roleId}`);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await deleteRole(roleId);
        alert("Role deleted successfully");
      } catch (error) {
        alert(`Failed to delete role: ${error.message}`);
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchRoles(newPage, pagination.pageSize);
  };

  if (loading && roles.length === 0) {
    return <div className="role-list-page"><p>Loading roles...</p></div>;
  }

  return (
    <div className="role-list-page">
      <div className="page-header">
        <h1>Roles Management</h1>
        <PermissionGate adminOnly permission="ROLE_CREATE">
          <button className="btn-primary" onClick={handleCreateRole}>
            + Create Role
          </button>
        </PermissionGate>
      </div>

      {error && <div className="error-message">{error}</div>}

      {roles.length === 0 ? (
        <div className="empty-state">
          <p>No roles found</p>
        </div>
      ) : (
        <>
          <div className="roles-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td>
                      <strong>{role.name}</strong>
                    </td>
                    <td>{role.description || "-"}</td>
                    <td>
                      <span className={`badge ${role.isSystem ? "system" : "custom"}`}>
                        {role.isSystem ? "System" : "Custom"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${role.isActive ? "active" : "inactive"}`}>
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-small btn-info"
                        onClick={() => handleViewRole(role._id)}
                        title="View details"
                      >
                        View
                      </button>
                      <PermissionGate adminOnly permission="ROLE_UPDATE">
                        <button
                          className="btn-small btn-warning"
                          onClick={() => handleEditRole(role._id)}
                          disabled={role.isSystem && role.name !== "USER"}
                          title={role.isSystem && role.name !== "USER" ? "Cannot edit system role" : "Edit"}
                        >
                          Edit
                        </button>
                      </PermissionGate>
                      <PermissionGate adminOnly permission="ROLE_DELETE">
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleDeleteRole(role._id, role.name)}
                          disabled={role.isSystem && role.name !== "USER"}
                          title={role.isSystem && role.name !== "USER" ? "Cannot delete system role" : "Delete"}
                        >
                          Delete
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RoleListPage;
