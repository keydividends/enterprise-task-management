import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';
import useTeams from '../hooks/useTeams';

const TeamListPage = () => {
  const { teams, loading, error, fetchTeams, createTeam } = useTeams();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => ({
    count: teams.length,
    members: teams.reduce((total, team) => total + (team.members?.length || 0), 0),
  }), [teams]);

  const handleSearch = async (event) => {
    const nextValue = event.target.value;
    setSearch(nextValue);
    await fetchTeams(nextValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createTeam({ ...form, leadId: 'mock-admin' });
      setForm({ name: '', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
            <h3>Create team</h3>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <span>Team name</span>
              <div className="input-wrap">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Release Operations" />
              </div>
            </div>
            <div className="field-group">
              <span>Description</span>
              <div className="input-wrap">
                <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this team is responsible for" />
              </div>
            </div>
            <button type="submit" className="primary-button" disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Creating...' : 'Create team'}
            </button>
          </form>
        </div>

        <div className="panel-block glass-card" style={{ minHeight: '280px' }}>
          <div className="panel-header">
            <h3>Find a team</h3>
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
          {!loading && !error && teams.map((team) => (
            <div key={team.id} className="task-row">
              <div className="task-pill-wrap">
                <span className="status-tag active">{team.isActive ? 'Active' : 'Archived'}</span>
                <span className="priority-tag medium">{team.memberCount || 0} members</span>
              </div>
              <strong>{team.name}</strong>
              <div className="task-meta">
                <span><Users size={14} /> {team.description || 'No description provided'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamListPage;
