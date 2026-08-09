import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import userService from '../services/userService';

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      await userService.createUser(formData);
      navigate('/users?toast=created');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-user-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Create New Employee</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
          Add a new team member or employee account to Enterprise Task Management.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <UserForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/users')}
        submitting={submitting}
      />
    </div>
  );
};

export default CreateUserPage;
