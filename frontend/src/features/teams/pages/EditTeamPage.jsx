import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TeamForm from '../components/TeamForm';
import TeamMemberManager from '../components/TeamMemberManager';
import Toast from '../components/Toast';
import useToasts from '../hooks/useToasts';
import useTeams from '../hooks/useTeams';
import teamService from '../services/teamService';
import '../styles/teams.css';

const EditTeamPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { updateTeam } = useTeams();
  const { toasts, dismiss, success, error: pushError } = useToasts();
  const [form, setForm] = useState({ name: '', description: '', leadId: 'mock-admin' });
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const current = await teamService.getTeam(teamId);
        const teamMembers = await teamService.getMembers(teamId);
        setTeam(current);
        setMembers(Array.isArray(teamMembers) ? teamMembers : []);
        setForm({
          name: current?.name || '',
          description: current?.description || '',
          leadId: current?.leadId || 'mock-admin',
        });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load the team.');
      }
    };

    loadTeam();
  }, [teamId]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      await updateTeam(teamId, payload);
      success('Team updated successfully.');
      navigate(`/teams/${teamId}`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to update the team.';
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

      <button type="button" className="team-back-nav" onClick={() => navigate(`/teams/${teamId}`)}>
        <ArrowLeft size={15} /> Back to team
      </button>

      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Edit team</p>
          <h1>Update team details</h1>
          <p className="helper-copy">Adjust the team context without losing member visibility.</p>
        </div>
      </section>

      {error ? <p className="helper-copy" role="alert">{error}</p> : null}

      <section className="panel-block glass-card">
        <TeamForm
          initialValues={form}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save changes"
          error={error}
          onCancel={() => navigate(`/teams/${teamId}`)}
          onBack={() => navigate(`/teams/${teamId}`)}
        />
      </section>

      {team ? (
        <section className="content-grid" style={{ marginTop: '16px' }}>
          <TeamMemberManager
            teamId={teamId}
            team={team}
            members={members}
            onMembersChange={setMembers}
            onMessage={(msg) => success(msg)}
            onError={pushError}
          />
        </section>
      ) : null}
    </div>
  );
};

export default EditTeamPage;
