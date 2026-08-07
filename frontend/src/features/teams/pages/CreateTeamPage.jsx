import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamForm from '../components/TeamForm';
import Toast from '../components/Toast';
import useToasts from '../hooks/useToasts';
import useTeams from '../hooks/useTeams';
import '../styles/teams.css';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { createTeam } = useTeams();
  const { toasts, dismiss, success, error: pushError } = useToasts();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const team = await createTeam(payload);
      success('Team created successfully.');
      navigate(`/teams/${team.id}`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to create team.';
      setError(message);
      pushError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="toast-stack">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={dismiss} />)}
      </div>

      <button type="button" className="team-back-nav" onClick={() => navigate('/teams')}>
        <ArrowLeft size={15} /> Back to teams
      </button>

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
          onBack={() => navigate('/teams')}
        />
      </section>
    </div>
  );
};

export default CreateTeamPage;
