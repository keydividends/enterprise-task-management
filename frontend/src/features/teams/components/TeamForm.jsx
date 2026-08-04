import { useState } from 'react';

const TeamForm = ({ initialValues = {}, onSubmit, submitting = false }) => {
  const [form, setForm] = useState(initialValues);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <span>Team name</span>
        <div className="input-wrap">
          <input value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Team name" />
        </div>
      </div>
      <div className="field-group">
        <span>Description</span>
        <div className="input-wrap">
          <input value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
        </div>
      </div>
      <button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Saving...' : 'Save team'}</button>
    </form>
  );
};

export default TeamForm;
