import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamForm from '../components/TeamForm';
import useTeams from '../hooks/useTeams';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { createTeam } = useTeams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    if (!payload.name?.trim()) {
      setError('Team name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const team = await createTeam({ ...payload, leadId: 'mock-admin' });
      navigate(`/teams/${team.id}`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to create team.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Create team</p>
          <h1>Start a new team workspace</h1>
          <p className="helper-copy">Create a team, invite members, and keep the work organized.</p>
        </div>
      </section>
      <section className="panel-block glass-card">
        <TeamForm
          initialValues={{ name: '', description: '' }}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Create team"
          error={error}
          onCancel={() => navigate('/teams')}
        />
      </section>
    </div>
  );
};

export default CreateTeamPage;
