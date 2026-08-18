import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Building, Briefcase, Phone, Save, ArrowLeft, UserCheck } from 'lucide-react';

export const UserForm = ({ initialValues = {}, onSubmit, onCancel, isEditing = false, submitting = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
    department: '',
    title: '',
    bio: '',
    role: '',
    status: 'ACTIVE',
    customId: '',
    managerCustomId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        email: initialValues.email || '',
        password: '',
        mobile: initialValues.mobile || '',
        department: initialValues.department || '',
        title: initialValues.title || '',
        bio: initialValues.bio || '',
        role: initialValues.role || '',
        status: initialValues.status || 'ACTIVE',
        customId: initialValues.customId || initialValues.user_id || '',
        managerCustomId: initialValues.managerCustomId || initialValues.managerId || '',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    // 2. Email Address Validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.mobile && formData.mobile.trim()) {
      const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
      if (!phoneRegex.test(formData.mobile.trim())) {
        newErrors.mobile = 'Please enter a valid phone number format (e.g. +1 555 123 4567).';
      }
    }

    if (!isEditing) {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <div className="form-group">
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            First Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: errors.firstName ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
          {errors.firstName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Last Name
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="employee@enterprise.com"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: errors.email ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
                background: isEditing ? 'var(--bg-disabled, #f1f5f9)' : 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
          {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            {isEditing ? 'New Password (Optional)' : 'Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Ex: User@123'}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: errors.password ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
          {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="department" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Department
          </label>
          <div style={{ position: 'relative' }}>
            <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Job Title
          </label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Developer"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.role ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
            }}
          >
            <option value="" disabled>Select Role</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
          </select>
          {errors.role && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.role}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mobile" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Mobile Phone
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="mobile"
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. +1 555 123 4567"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: errors.mobile ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
              }}
            />
          </div>
          {errors.mobile && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.mobile}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-input, #ffffff)',
            }}
          >
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="employee_custom_id" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Employee ID <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '13px' }}>(used to assign projects)</span>
          </label>
          <input
            id="employee_custom_id"
            type="text"
            name="customId"
            value={formData.customId}
            onChange={handleChange}
            placeholder="e.g. EMP-042 or john.dev"
            disabled={isEditing}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.customId ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
              background: isEditing ? 'var(--bg-disabled, #f1f5f9)' : 'var(--bg-input, #ffffff)',
              fontFamily: 'monospace',
            }}
          />
          {errors.customId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.customId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="managerCustomId" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Associate Manager ID
          </label>
          <div style={{ position: 'relative' }}>
            <UserCheck size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              id="managerCustomId"
              type="text"
              name="managerCustomId"
              value={formData.managerCustomId}
              onChange={handleChange}
              placeholder="e.g. MGR-001 or ADMIN-001"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-input, #ffffff)',
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Bio / Notes
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Short bio or administrative notes..."
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 22px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            color: '#ffffff',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <Save size={16} /> {submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
