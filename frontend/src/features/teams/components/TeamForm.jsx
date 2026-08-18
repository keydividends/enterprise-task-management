import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import teamService from '../services/teamService';

const TeamForm = ({ initialValues = {}, onSubmit, submitting = false, submitLabel = 'Save team', error, onCancel, onBack }) => {
  const [form, setForm] = useState({ name: '', description: '', leadId: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [managerOptions, setManagerOptions] = useState([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState('');

  useEffect(() => {
    setForm({
      name: initialValues.name || '',
      description: initialValues.description || '',
      leadId: initialValues.leadId || '',
    });
    setFieldErrors({});
  }, [initialValues]);

  useEffect(() => {
    let active = true;
    const loadManagers = async () => {
      setManagersLoading(true);
      try {
        const managers = await teamService.getEligibleManagers();
        if (active) {
          setManagerOptions(managers);
          setManagersError('');
        }
      } catch (requestError) {
        if (active) {
          setManagerOptions([]);
          setManagersError(requestError?.response?.data?.message || 'Unable to load eligible managers.');
        }
      } finally {
        if (active) setManagersLoading(false);
      }
    };
    loadManagers();
    return () => { active = false; };
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.name?.trim()) {
      errors.name = 'Team name is required.';
    } else if (form.name.trim().length > 150) {
      errors.name = 'Team name must be 150 characters or fewer.';
    }
    if (!form.leadId) {
      errors.leadId = 'Select a manager.';
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
        <label htmlFor="team-lead">Manager <span className="required-mark">*</span></label>
        <div className="input-wrap">
          <select
            id="team-lead"
            name="leadId"
            value={form.leadId}
            onChange={(event) => handleChange('leadId', event.target.value)}
            disabled={managersLoading || Boolean(managersError) || managerOptions.length === 0}
            aria-invalid={Boolean(fieldErrors.leadId)}
          >
            <option value="">
              {managersLoading ? 'Loading managers...' : managerOptions.length ? 'Select manager' : 'No eligible managers available'}
            </option>
            {managerOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name || option.email || option.id}{option.email ? ` — ${option.email}` : ''}</option>
            ))}
          </select>
        </div>
        {managersError ? <small className="field-error" role="alert">{managersError}</small> : null}
        {!managersLoading && !managersError && managerOptions.length === 0 ? <small className="helper-copy">No active users with an eligible manager or lead role are available.</small> : null}
        {fieldErrors.leadId ? <small className="field-error" role="alert">{fieldErrors.leadId}</small> : null}
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
