import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PermissionGate from '../../roles/components/PermissionGate';
import TeamMemberManager from '../components/TeamMemberManager';
import Toast from '../components/Toast';
import useToasts from '../hooks/useToasts';
import teamService from '../services/teamService';
import '../styles/teams.css';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const TeamDetailsPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { toasts, dismiss, success, error: pushError } = useToasts();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadTeam = async () => {
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
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const handleDelete = async () => {
    if (!window.confirm('Archive this team?')) {
      return;
    }
    setDeleting(true);
    try {
      await teamService.deleteTeam(teamId);
      success('Team archived.');
      navigate('/teams');
    } catch (err) {
      pushError(err?.response?.data?.message || err?.message || 'Unable to delete the team.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="panel-block glass-card">Loading team...</div>;
  }

  if (!team) {
    return <div className="panel-block glass-card">Team not found.</div>;
  }

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
          <p className="eyebrow secondary">Team detail</p>
          <h1>{team.name}</h1>
          <p className="helper-copy">{team.description || 'Shared work context for projects and tasks.'}</p>
          <div className="team-card-meta" style={{ marginTop: '8px' }}>
            <span><User size={14} /> Lead: {team.leadId}</span>
            <span><CalendarDays size={14} /> Created: {formatDate(team.createdAt)}</span>
            <span className={`status-tag ${team.isActive ? 'review' : 'danger'}`}>{team.status || (team.isActive ? 'ACTIVE' : 'INACTIVE')}</span>
          </div>
        </div>
        <div className="button-row">
          <PermissionGate permission="TEAM_UPDATE" fallback={null}>
            <Link to={`/teams/${teamId}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit team</Link>
          </PermissionGate>
          <PermissionGate permission="TEAM_MANAGE_MEMBERS" fallback={null}>
            <Link to={`/teams/${teamId}/members`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Manage members</Link>
          </PermissionGate>
          <PermissionGate permission="TEAM_DELETE" fallback={null}>
            <button type="button" className="danger-button compact" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete team'}
            </button>
          </PermissionGate>
        </div>
      </section>

      {error ? <p className="helper-copy" role="alert">{error}</p> : null}

      <section className="content-grid">
        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Overview</h3>
          </div>
          <p><strong>Lead:</strong> {team.leadId}</p>
          <p><strong>Status:</strong> {team.status || (team.isActive ? 'Active' : 'Inactive')}</p>
          <p><strong>Member count:</strong> {members.length}</p>
          <p><strong>Projects:</strong> {team.projectIds?.length ? team.projectIds.join(', ') : 'None'}</p>
          <p><strong>Created:</strong> {formatDate(team.createdAt)}</p>
        </div>

        <TeamMemberManager
          teamId={teamId}
          team={team}
          members={members}
          onMembersChange={setMembers}
          onMessage={(msg) => success(msg)}
          onError={pushError}
        />
      </section>
    </div>
  );
};

export default TeamDetailsPage;
