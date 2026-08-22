import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import userService from '../services/userService';
import { useAuth } from '../../auth/hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const EditUserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Rule 3: Only Admins and Managers are allowed to edit employee profiles
  const canEdit = currentUser?.role === 'COMPANY_ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MANAGER' || currentUser?.permissions?.includes('USER_UPDATE') || String(currentUser?.id) === String(userId);

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

  if (!canEdit) {
    return (
      <div className="glass-card" style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', borderRadius: '16px' }}>
        <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Access Restricted</h2>
        <p style={{ margin: '8px 0 20px 0', opacity: 0.7, fontSize: '14px' }}>
          Only Administrators and Managers are permitted to edit employee profiles.
        </p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="edit-user-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/users')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color, #e2e8f0)',
          background: 'transparent',
          cursor: 'pointer',
          marginBottom: '18px',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to Employees
      </button>

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
