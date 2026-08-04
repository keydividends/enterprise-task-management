import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const team = await teamService.createTeam({ ...form, leadId: 'mock-admin' });
    navigate(`/teams/${team.id}`);
    setSubmitting(false);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Create team</p>
          <h1>Start a new team workspace</h1>
        </div>
      </section>
      <section className="panel-block glass-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <span>Team name</span>
            <div className="input-wrap">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Team name" />
            </div>
          </div>
          <div className="field-group">
            <span>Description</span>
            <div className="input-wrap">
              <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            </div>
          </div>
          <button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Creating...' : 'Create team'}</button>
        </form>
      </section>
    </div>
  );
};

export default CreateTeamPage;
