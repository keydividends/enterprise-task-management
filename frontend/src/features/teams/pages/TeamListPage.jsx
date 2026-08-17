import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import PermissionGate from '../../roles/components/PermissionGate';
import useTeams from '../hooks/useTeams';
import useToasts from '../hooks/useToasts';
import Toast from '../components/Toast';
import '../styles/teams.css';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const TeamListPage = () => {
  const { teams, loading, error, pagination, refresh, deleteTeam } = useTeams();
  const { toasts, dismiss, success, error: pushError } = useToasts();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyTeamId, setBusyTeamId] = useState(null);

  const summary = useMemo(() => ({
    count: Array.isArray(teams) ? teams.length : 0,
    members: Array.isArray(teams) ? teams.reduce((total, team) => total + (team.memberCount || team.members?.length || 0), 0) : 0,
  }), [teams]);

  const handleSearch = async (event) => {
    const nextValue = event.target.value;
    setSearch(nextValue);
    setPage(1);
    await refresh(nextValue, 1, pagination.pageSize);
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return;
    setPage(nextPage);
    await refresh(search, nextPage, pagination.pageSize);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Archive this team?')) {
      return;
    }
    setBusyTeamId(teamId);
    try {
      await deleteTeam(teamId);
      success('Team archived.');
      await refresh(search, page, pagination.pageSize);
    } catch (err) {
      pushError(err?.response?.data?.message || err?.message || 'Unable to delete the team.');
    } finally {
      setBusyTeamId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="toast-stack">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={dismiss} />)}
      </div>

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

      {error ? <p className="helper-copy" role="alert">{error}</p> : null}

      <section className="content-grid">
        <div className="panel-block glass-card" style={{ minHeight: '280px' }}>
          <div className="panel-header">
            <h3>Team directory</h3>
            <div className="button-row">
              <button type="button" className="secondary-button compact" onClick={() => refresh(search, page, pagination.pageSize)}>
                <RefreshCw size={14} /> Refresh
              </button>
              <PermissionGate permission="TEAM_CREATE" fallback={null}>
                <Link to="/teams/create" className="primary-button compact" style={{ textDecoration: 'none' }}>
                  <Plus size={16} /> Create team
                </Link>
              </PermissionGate>
            </div>
          </div>

          <div className="field-group">
            <span>Search</span>
            <div className="input-wrap">
              <Search size={16} />
              <input value={search} onChange={handleSearch} placeholder="Search by team name or description" />
            </div>
          </div>

          {loading ? <p className="helper-copy">Loading teams...</p> : null}

          {!loading && !error && Array.isArray(teams) && teams.length === 0 ? (
            <div className="empty-state">No teams match your search yet.</div>
          ) : null}

          {!loading && !error && Array.isArray(teams) && teams.length > 0 ? (
            <div className="team-directory">
              {teams.map((team) => (
                <div key={team.id} className="team-card glass-card">
                  <div className="team-card-main">
                    <div className="team-card-title">
                      <strong>{team.name}</strong>
                      <span className={`status-tag ${team.isActive ? 'review' : 'danger'}`}>
                        {team.status || (team.isActive ? 'ACTIVE' : 'INACTIVE')}
                      </span>
                      <span className="priority-tag medium">{team.memberCount || team.members?.length || 0} members</span>
                    </div>
                    <p className="team-card-desc">{team.description || 'No description provided'}</p>
                    <div className="team-card-meta">
                      <span><User size={14} /> Lead: {team.leadId}</span>
                      <span><CalendarDays size={14} /> Created: {formatDate(team.createdAt)}</span>
                    </div>
                  </div>
                  <div className="team-card-actions">
                    <Link to={`/teams/${team.id}`} className="secondary-button">View</Link>
                    <PermissionGate permission="TEAM_UPDATE" fallback={null}>
                      <Link to={`/teams/${team.id}/edit`} className="secondary-button">Edit</Link>
                    </PermissionGate>
                    <PermissionGate permission="TEAM_MANAGE_MEMBERS" fallback={null}>
                      <Link to={`/teams/${team.id}/members`} className="secondary-button">Members</Link>
                    </PermissionGate>
                    <PermissionGate permission="TEAM_DELETE" fallback={null}>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(team.id)}
                        disabled={busyTeamId === team.id}
                      >
                        {busyTeamId === team.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !error && (pagination.totalPages || 1) > 1 ? (
            <div className="pagination-bar">
              <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                <ChevronLeft size={14} /> Prev
              </button>
              <span>Page {page} of {pagination.totalPages || 1} ({pagination.totalItems} teams)</span>
              <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= (pagination.totalPages || 1)}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default TeamListPage;
