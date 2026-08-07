import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

const TeamForm = ({ initialValues = {}, onSubmit, submitting = false, submitLabel = 'Save team', error, onCancel, onBack }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', leadId: 'mock-admin' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Hardcoded lead options are not ideal; the realistic approach is to load
  // users from the backend. For this sprint we expose the known mock users
  // plus the currently authenticated user so the lead drop-down is usable.
  const leadOptions = useMemo(() => {
    const options = [
      { id: 'mock-admin', label: 'Ava Cole (Admin)' },
      { id: 'mock-maya', label: 'Maya Singh' },
      { id: 'mock-alex', label: 'Alex Chen' },
    ];
    if (user?.id && !options.some((o) => o.id === user.id)) {
      options.unshift({ id: user.id, label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.id });
    }
    return options;
  }, [user]);

  useEffect(() => {
    setForm({
      name: initialValues.name || '',
      description: initialValues.description || '',
      leadId: initialValues.leadId || 'mock-admin',
    });
    setFieldErrors({});
  }, [initialValues]);

  const validate = () => {
    const errors = {};
    if (!form.name?.trim()) {
      errors.name = 'Team name is required.';
    } else if (form.name.trim().length > 150) {
      errors.name = 'Team name must be 150 characters or fewer.';
    }
    return errors;
  };

  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    onSubmit?.(form);
  };

  return (
    <form className="team-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="helper-copy" role="alert">{error}</p> : null}

      <div className="field-group">
        <label htmlFor="team-name">Team name <span className="required-mark">*</span></label>
        <div className="input-wrap">
          <input
            id="team-name"
            name="name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g. Platform Engineering"
            aria-invalid={Boolean(fieldErrors.name)}
          />
        </div>
        {fieldErrors.name ? <small className="field-error" role="alert">{fieldErrors.name}</small> : null}
      </div>

      <div className="field-group">
        <label htmlFor="team-description">Description</label>
        <div className="input-wrap">
          <input
            id="team-description"
            name="description"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            placeholder="Describe the team's purpose"
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="team-lead">Team lead</label>
        <div className="input-wrap">
          <select
            id="team-lead"
            name="leadId"
            value={form.leadId}
            onChange={(event) => handleChange('leadId', event.target.value)}
          >
            {leadOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="team-form-actions">
        <button type="submit" className="primary-button" disabled={submitting}>
          <Save size={16} /> {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>Cancel</button>
        ) : null}
        {onBack ? (
          <button type="button" className="ghost-button" onClick={onBack} disabled={submitting}>
            <ArrowLeft size={16} /> Back
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default TeamForm;
