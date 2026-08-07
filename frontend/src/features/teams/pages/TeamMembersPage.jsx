import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PermissionGate from '../../roles/components/PermissionGate';
import TeamMemberManager from '../components/TeamMemberManager';
import Toast from '../components/Toast';
import useToasts from '../hooks/useToasts';
import teamService from '../services/teamService';
import '../styles/teams.css';

const TeamMembersPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { toasts, dismiss, success, error: pushError } = useToasts();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const currentTeam = await teamService.getTeam(teamId);
      const teamMembers = await teamService.getMembers(teamId);
      setTeam(currentTeam || null);
      setMembers(Array.isArray(teamMembers) ? teamMembers : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load team.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (loading) {
    return <div className="panel-block glass-card">Loading members...</div>;
  }

  if (!team) {
    return <div className="panel-block glass-card">Team not found.</div>;
  }

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
          <p className="eyebrow secondary">Member management</p>
          <h1>{team.name} — Members</h1>
          <p className="helper-copy">Add, update, and remove team members. Duplicate members are prevented automatically.</p>
        </div>
      </section>

      {error ? <p className="helper-copy" role="alert">{error}</p> : null}

      <section className="content-grid">
        <PermissionGate permission="TEAM_MANAGE_MEMBERS" fallback={
          <div className="panel-block glass-card">
            <div className="empty-state">You do not have permission to manage team members.</div>
          </div>
        }>
          <TeamMemberManager
            teamId={teamId}
            team={team}
            members={members}
            onMembersChange={setMembers}
            onMessage={(msg) => success(msg)}
            onError={pushError}
          />
        </PermissionGate>
      </section>
    </div>
  );
};

export default TeamMembersPage;
