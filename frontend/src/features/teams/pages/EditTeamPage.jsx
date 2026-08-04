import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeamForm from '../components/TeamForm';
import useTeams from '../hooks/useTeams';
import teamService from '../services/teamService';

const EditTeamPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { updateTeam } = useTeams();
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeam = async () => {
      const team = await teamService.getTeam(teamId);
      setForm({ name: team?.name || '', description: team?.description || '' });
    };

    loadTeam();
  }, [teamId]);

  const handleSubmit = async (payload) => {
    if (!payload.name?.trim()) {
      setError('Team name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await updateTeam(teamId, payload);
      navigate(`/teams/${teamId}`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to update the team.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Edit team</p>
          <h1>Update team details</h1>
          <p className="helper-copy">Adjust the team context without losing member visibility.</p>
        </div>
      </section>
      <section className="panel-block glass-card">
        <TeamForm
          initialValues={form}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save changes"
          error={error}
          onCancel={() => navigate(`/teams/${teamId}`)}
        />
      </section>
    </div>
  );
};

export default EditTeamPage;
