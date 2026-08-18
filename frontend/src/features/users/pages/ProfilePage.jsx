import React, { useEffect, useState } from 'react';
import { Save, Camera, Check } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import userService from '../services/userService';

export const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({
    customId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    department: '',
    title: '',
    bio: '',
    avatarUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await userService.getMyProfile();
        if (res && res.data) {
          const rawCustomId = res.data.customId || res.data.user_id || authUser?.customId || authUser?.user_id;
          const fallbackCustomId = res.data.email ? `EMP-${res.data.email.split('@')[0]}` : 'EMP-001';

          setProfile({
            customId: rawCustomId || fallbackCustomId,
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            email: res.data.email || authUser?.email || '',
            mobile: res.data.mobile || '',
            department: res.data.department || '',
            title: res.data.title || '',
            bio: res.data.bio || '',
            avatarUrl: res.data.avatarUrl || '',
          });
        }
      } catch {
        if (authUser) {
          const rawCustomId = authUser.customId || authUser.user_id;
          const fallbackCustomId = authUser.email ? `EMP-${authUser.email.split('@')[0]}` : 'EMP-001';

          setProfile((prev) => ({
            ...prev,
            customId: rawCustomId || fallbackCustomId,
            firstName: authUser.firstName || '',
            lastName: authUser.lastName || '',
            email: authUser.email || '',
            role: authUser.role || 'USER',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await userService.updateMyProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        mobile: profile.mobile,
        department: profile.department,
        title: profile.title,
        bio: profile.bio,
      });
      setMessage('Employee profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', opacity: 0.7 }}>Loading your profile...</div>;
  }

  const displayEmployeeId = profile.customId || (profile.email ? `EMP-${profile.email.split('@')[0]}` : 'EMP-001');

  return (
    <div className="profile-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>My Profile</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
          Manage your employee information, contact details, and account preferences.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
        {/* Avatar & Identifiers Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
              position: 'relative',
            }}
          >
            {profile.firstName?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              {profile.firstName} {profile.lastName}
            </h3>
            <p style={{ margin: '2px 0 4px 0', fontSize: '14px', opacity: 0.6 }}>{profile.email}</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', opacity: 0.8, fontFamily: 'monospace', userSelect: 'all' }}>
              <strong>Employee ID:</strong> {displayEmployeeId}
            </p>
            <button
              type="button"
              onClick={() => alert('Avatar upload modal activated.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'transparent',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Camera size={14} /> Change Photo
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="employee_id_display" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
              Employee ID
            </label>
            <input
              id="employee_id_display"
              type="text"
              value={displayEmployeeId}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-disabled, #f1f5f9)',
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#4f46e5',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email_display" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Email Address</label>
            <input
              id="email_display"
              type="email"
              value={profile.email}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-disabled, #f1f5f9)',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_firstName" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>First Name</label>
            <input
              id="profile_firstName"
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_lastName" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Last Name</label>
            <input
              id="profile_lastName"
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_mobile" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Mobile Phone</label>
            <input
              id="profile_mobile"
              type="text"
              name="mobile"
              value={profile.mobile}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_department" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Department</label>
            <input
              id="profile_department"
              type="text"
              name="department"
              value={profile.department}
              onChange={handleChange}
              placeholder="e.g. Employee Management"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="profile_title" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Job Title</label>
            <input
              id="profile_title"
              type="text"
              name="title"
              value={profile.title}
              onChange={handleChange}
              placeholder="e.g. Lead Engineer"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="profile_bio" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>About Me</label>
            <textarea
              id="profile_bio"
              name="bio"
              rows="3"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Write a brief intro..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
