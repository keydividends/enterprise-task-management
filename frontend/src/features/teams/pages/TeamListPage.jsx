import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Search, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useTeams from '../hooks/useTeams';

const TeamListPage = () => {
  const navigate = useNavigate();
  const { teams, loading, error, refresh, deleteTeam } = useTeams();
  const [search, setSearch] = useState('');
  const [busyTeamId, setBusyTeamId] = useState(null);

  const summary = useMemo(() => ({
    count: teams.length,
    members: teams.reduce((total, team) => total + (team.memberCount || team.members?.length || 0), 0),
  }), [teams]);

  const handleSearch = async (event) => {
    const nextValue = event.target.value;
    setSearch(nextValue);
    await refresh(nextValue);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Archive this team?')) {
      return;
    }

    setBusyTeamId(teamId);
    try {
      await deleteTeam(teamId);
      navigate('/teams');
    } finally {
      setBusyTeamId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <motion.section className="hero-panel glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="eyebrow secondary">Team workspace</p>
          <h1>Collaborate with shared team spaces</h1>
          <p className="helper-copy">Create teams, assign leads, and keep members connected across projects and tasks.</p>
        </div>
        <div className="hero-score-panel">
          <div className="score-ring">
            <div className="score-ring-inner">
              <span>{summary.count}</span>
            </div>
          </div>
          <div className="score-copy">
            <strong>{summary.members} active members</strong>
            <small>Across {summary.count} teams</small>
          </div>
        </div>
      </motion.section>

      <section className="content-grid">
        <div className="panel-block glass-card" style={{ minHeight: '280px' }}>
          <div className="panel-header">
            <h3>Team directory</h3>
            <div className="button-row">
              <button type="button" className="secondary-button compact" onClick={() => refresh(search)}>
                <RefreshCw size={14} /> Refresh
              </button>
              <Link to="/teams/create" className="primary-button compact" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> Create team
              </Link>
            </div>
          </div>

          <div className="field-group">
            <span>Search</span>
            <div className="input-wrap">
              <Search size={16} />
              <input value={search} onChange={handleSearch} placeholder="Search by team name" />
            </div>
          </div>

          {loading ? <p className="helper-copy">Loading teams...</p> : null}
          {error ? <p className="helper-copy">{error}</p> : null}
          {!loading && !error && teams.length === 0 ? (
            <div className="empty-state">No teams match your search yet.</div>
          ) : null}
          {!loading && !error && teams.map((team) => (
            <div key={team.id} className="task-row">
              <div className="task-pill-wrap">
                <span className="status-tag review">{team.isActive ? 'Active' : 'Archived'}</span>
                <span className="priority-tag medium">{team.memberCount || team.members?.length || 0} members</span>
              </div>
              <strong>{team.name}</strong>
              <div className="task-meta">
                <span><Users size={14} /> {team.description || 'No description provided'}</span>
              </div>
              <div className="button-row">
                <Link to={`/teams/${team.id}`} className="secondary-button compact" style={{ textDecoration: 'none' }}>View details</Link>
                <Link to={`/teams/${team.id}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit</Link>
                <button type="button" className="ghost-button" onClick={() => handleDelete(team.id)} disabled={busyTeamId === team.id}>
                  {busyTeamId === team.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamListPage;
