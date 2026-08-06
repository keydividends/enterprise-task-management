import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TeamMemberManager from '../components/TeamMemberManager';
import teamService from '../services/teamService';

const TeamDetailsPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
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

    loadTeam();
  }, [teamId]);

  const handleDelete = async () => {
    if (!window.confirm('Archive this team?')) {
      return;
    }

    try {
      await teamService.deleteTeam(teamId);
      navigate('/teams');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to delete the team.');
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
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Team detail</p>
          <h1>{team.name}</h1>
          <p className="helper-copy">{team.description || 'Shared work context for projects and tasks.'}</p>
        </div>
        <div className="button-row">
          <Link to={`/teams/${teamId}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit team</Link>
          <button type="button" className="ghost-button" onClick={handleDelete}>Delete team</button>
        </div>
      </section>

      {error ? <p className="helper-copy" role="alert">{error}</p> : null}
      {notice ? <p className="helper-copy">{notice}</p> : null}

      <section className="content-grid">
        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Overview</h3>
          </div>
          <p><strong>Lead:</strong> {team.leadId}</p>
          <p><strong>Status:</strong> {team.isActive ? 'Active' : 'Archived'}</p>
          <p><strong>Member count:</strong> {members.length}</p>
          <p><strong>Projects:</strong> {team.projectIds?.length ? team.projectIds.join(', ') : 'None'}</p>
        </div>

        <TeamMemberManager
          teamId={teamId}
          members={members}
          onMembersChange={setMembers}
          onMessage={setNotice}
          onError={setError}
        />
      </section>
    </div>
  );
};

export default TeamDetailsPage;
