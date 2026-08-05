import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";
import RoleForm from "../components/RoleForm";
import "../styles/RoleCreateEditPage.css";

const CreateRolePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createRole } = useRoles();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createRole(formData);
      alert("Role created successfully");
      navigate(`/roles/${response.data._id}`);
    } catch (err) {
      setError(err.message || "Failed to create role");
      console.error("Error creating role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/roles");
  };

  return (
    <div className="role-create-edit-page">
      <div className="page-header">
        <h1>Create New Role</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <RoleForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
      </div>
    </div>
  );
};

export default CreateRolePage;
