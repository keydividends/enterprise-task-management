import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useRoles } from "../hooks/useRoles";
import RoleForm from "../components/RoleForm";
import "../styles/RoleCreateEditPage.css";

const EditRolePage = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateRole, getRoleById } = useRoles();

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
  }, [roleId, getRoleById]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await updateRole(roleId, formData);
      alert("Role updated successfully");
      navigate(`/roles/${roleId}`);
    } catch (err) {
      setError(err.message || "Failed to update role");
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/roles/${roleId}`);
  };

  if (user?.role !== "ADMIN") {
    return <Navigate to="/roles" replace />;
  }

  if (loading && !role) {
    return <div className="role-create-edit-page"><p>Loading role...</p></div>;
  }

  if (error && !role) {
    return <div className="role-create-edit-page"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="role-create-edit-page">
      <div className="page-header">
        <h1>Edit Role: {role?.name}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <RoleForm
          role={role}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EditRolePage;
