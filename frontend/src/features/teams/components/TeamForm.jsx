import { useEffect, useState } from 'react';

const TeamForm = ({ initialValues = {}, onSubmit, submitting = false, submitLabel = 'Save team', error, onCancel }) => {
  const [form, setForm] = useState({ name: '', description: '', leadId: 'mock-admin' });

  useEffect(() => {
    setForm({
      name: initialValues.name || '',
      description: initialValues.description || '',
      leadId: initialValues.leadId || 'mock-admin',
    });
  }, [initialValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error ? <p className="helper-copy" role="alert">{error}</p> : null}
      <div className="field-group">
        <span>Team name</span>
        <div className="input-wrap">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Team name" />
        </div>
      </div>
      <div className="field-group">
        <span>Description</span>
        <div className="input-wrap">
          <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the team" />
        </div>
      </div>
      <div className="button-row">
        <button type="submit" className="primary-button compact" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
        {onCancel ? (
          <button type="button" className="secondary-button compact" onClick={onCancel}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
};

export default TeamForm;
