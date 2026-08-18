import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, FolderKanban, RefreshCw, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import useDashboard from '../hooks/useDashboard';
import WidgetLayoutEditor from '../components/WidgetLayoutEditor';
import { useAuth } from '../../auth/hooks/useAuth';
import projectService from '../../projects/services/projectService';

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'No date';

const DashboardPage = () => {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const params = useMemo(() => (projectId ? { projectId } : {}), [projectId]);

  useEffect(() => {
    projectService.getProjects({ pageSize: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setProjects(list);
      })
      .catch(() => {});
  }, []);

  const { data, error, loading, refresh } = useDashboard(params);
  const summary = data?.summary || {};
  const cards = [
    ['Projects', summary.totalProjects ?? 0, FolderKanban],
    ['Tasks', summary.totalTasks ?? 0, Target],
    ['Pending', summary.pendingTasks ?? 0, Users],
    ['Completed', summary.completedTasks ?? 0, CheckCircle2],
  ];

  if (loading && !data) return <div className="dashboard-page"><section className="panel-block glass-card"><p>Loading dashboard...</p></section></div>;
  if (error && !data) return <div className="dashboard-page"><section className="panel-block glass-card"><h2>Dashboard unavailable</h2><p className="helper-copy">Metrics could not be loaded.</p><button type="button" className="primary-button compact" onClick={refresh}><RefreshCw size={15} /> Retry</button></section></div>;

  const myWork = data?.myWork || {};

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div><p className="eyebrow secondary">Dashboard</p><h1>{user?.firstName || 'Your'} delivery overview</h1><p className="helper-copy">Live metrics from the tasks and projects available to your account.</p></div>
        <button type="button" className="secondary-button compact" onClick={refresh}><RefreshCw size={15} /> Refresh</button>
      </section>

      <section className="panel-block glass-card" aria-label="Dashboard filters">
        <label htmlFor="dashboard-project" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Project filter</label>
        <select
          id="dashboard-project"
          style={{ width: '100%', maxWidth: '320px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border, #ccc)', background: 'var(--bg-surface, #fff)', color: 'inherit' }}
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id || p._id} value={p.id || p._id}>
              {p.name || p.key} {p.key ? `(${p.key})` : ''}
            </option>
          ))}
        </select>
      </section>

      <section className="stats-grid">
        {cards.map(([label, value, Icon]) => <div key={label} className="glass-card stat-card"><div className="stat-header"><span>{label}</span><div className="stat-icon"><Icon size={16} /></div></div><strong>{value}</strong></div>)}
      </section>

      <section className="panel-block glass-card">
        <div className="panel-header">
          <h3>My Work</h3>
          <Link className="ghost-button" to="/tasks">View all tasks</Link>
        </div>
        <div className="stats-grid" style={{ marginTop: '0.75rem' }}>
          <div className="glass-card stat-card"><div className="stat-header"><span>Assigned to me</span></div><strong>{myWork.assigned ?? 0}</strong></div>
          <div className="glass-card stat-card"><div className="stat-header"><span>In progress</span></div><strong>{myWork.inProgress ?? 0}</strong></div>
          <div className="glass-card stat-card"><div className="stat-header"><span>Completed</span></div><strong>{myWork.completed ?? 0}</strong></div>
          <div className="glass-card stat-card"><div className="stat-header"><span>Due soon</span></div><strong>{myWork.dueSoon ?? 0}</strong></div>
          <div className="glass-card stat-card"><div className="stat-header"><span>Overdue</span></div><strong>{myWork.overdue ?? 0}</strong></div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-block glass-card"><div className="panel-header"><h3>Tasks by status</h3><Link className="ghost-button" to="/reports/tasks">Open reports</Link></div>{data?.status?.length ? data.status.map((row) => <div className="task-row" key={row.status}><strong>{row.status}</strong><span>{row.count}</span></div>) : <p className="helper-copy">No status data for this scope.</p>}</div>
        <div className="panel-block glass-card"><div className="panel-header"><h3>Priority</h3></div>{data?.priority?.length ? data.priority.map((row) => <div className="task-row" key={row.priority}><strong>{row.priority}</strong><span>{row.count}</span></div>) : <p className="helper-copy">No priority data for this scope.</p>}</div>
      </section>

      <section className="content-grid">
        <div className="panel-block glass-card"><div className="panel-header"><h3>Project progress</h3><Link className="ghost-button" to="/reports/projects">Open reports</Link></div>{data?.projectProgress?.length ? data.projectProgress.map((row) => <div className="task-row" key={row.projectId}><strong>{row.name || row.projectId}</strong><span>{row.completionPercentage}%</span></div>) : <p className="helper-copy">No project progress data.</p>}</div>
        <div className="panel-block glass-card"><div className="panel-header"><h3>Recent activity</h3></div>{data?.activity?.length ? data.activity.map((entry, index) => <div className="task-row" key={`${entry.taskKey}-${entry.changedAt}-${index}`}><strong>{entry.taskKey}</strong><span>{entry.field} changed</span></div>) : <p className="helper-copy">No recent activity.</p>}</div>
      </section>

      <section className="bottom-grid">
        <div className="panel-block glass-card"><div className="panel-header"><h3>Upcoming deadlines</h3></div>{data?.deadlines?.length ? data.deadlines.map((task) => <div className="task-row" key={task.taskKey}><span><CalendarDays size={14} /> {task.taskKey}</span><strong>{formatDate(task.dueDate)}</strong></div>) : <p className="helper-copy">No upcoming deadlines.</p>}</div>
        <div className="panel-block glass-card"><div className="panel-header"><h3>Team workload</h3></div>{data?.workload?.length ? data.workload.map((row) => <div className="task-row" key={row.userId}><strong>{row.name}</strong><span>{row.completed}/{row.assigned}</span></div>) : <p className="helper-copy">No workload data.</p>}</div>
      </section>
      <WidgetLayoutEditor />
    </div>
  );
};

export default DashboardPage;