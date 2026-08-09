import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import userService from '../services/userService';

export const EditUserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await userService.getUserById(userId);
        if (res && res.data) {
          setUserData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      await userService.updateUser(userId, formData);
      navigate('/users?toast=updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', opacity: 0.7 }}>
        Loading employee information...
      </div>
    );
  }

  return (
    <div className="edit-user-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Edit Employee Profile</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
          Update account details, role assignments, or department for employee {userData?.fullName || userData?.email}.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <UserForm
        initialValues={userData}
        isEditing={true}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/users/${userId}`)}
        submitting={submitting}
      />
    </div>
  );
};

export default EditUserPage;
