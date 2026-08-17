import { motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

const stats = [
  { label: 'Projects', value: '24', change: '+12%', icon: FolderKanban },
  { label: 'Teams', value: '8', change: '+3', icon: Users },
  { label: 'Tasks', value: '146', change: '+18%', icon: Target },
  { label: 'Completed', value: '86%', change: '+8%', icon: CheckCircle2 },
];

const tasks = [
  { title: 'Launch onboarding workflow', status: 'In progress', priority: 'High', due: 'Today' },
  { title: 'Finalize Q3 roadmap plan', status: 'Review', priority: 'Medium', due: 'Tomorrow' },
  { title: 'Prepare executive dashboard', status: 'Blocked', priority: 'Low', due: 'Friday' },
];

const activity = [
  { title: 'Design sprint approved', detail: 'Product design approved the enterprise homepage v2', time: '10 min ago' },
  { title: 'PM review complete', detail: 'Marketing team updated campaign milestones', time: '32 min ago' },
  { title: 'Team standup updated', detail: 'Development shipped 3 blockers resolved today', time: '1 hour ago' },
];

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <motion.section className="hero-panel glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="eyebrow secondary">Good morning</p>
          <h1>{user?.firstName || 'Ava'} — your work is moving fast.</h1>
          <p className="helper-copy">Here is a live overview of delivery, team health, and priorities across the portfolio.</p>

          <div className="hero-actions">
            <button type="button" className="primary-button compact">Create task</button>
          </div>
        </div>

        <div className="hero-score-panel">
          <div className="score-ring">
            <div className="score-ring-inner">
              <span>84%</span>
            </div>
          </div>
          <div className="score-copy">
            <strong>Productivity score</strong>
            <small>+12% vs last week</small>
          </div>
        </div>
      </motion.section>

      <section className="stats-grid">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <motion.div key={label} className="glass-card stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="stat-header">
              <span>{label}</span>
              <div className="stat-icon"><Icon size={16} /></div>
            </div>
            <strong>{value}</strong>
            <div className="stat-footer">
              <TrendingUp size={14} />
              <small>{change} this month</small>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel-block glass-card large-panel">
          <div className="panel-header">
            <h3>Portfolio overview</h3>
            <button type="button" className="ghost-button">This month</button>
          </div>

          <div className="chart-stack">
            <div className="bar-chart">
              {[52, 68, 58, 84, 71, 96, 88].map((value, index) => (
                <div key={value} className="bar-col">
                  <span style={{ height: `${value}%` }} />
                  <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small>
                </div>
              ))}
            </div>

            <div className="line-chart">
              <span className="line line-a" />
              <span className="line line-b" />
            </div>
          </div>
        </div>

        <div className="panel-block glass-card sidebar-panel">
          <div className="panel-header">
            <h3>Upcoming deadlines</h3>
            <button type="button" className="ghost-button">View all</button>
          </div>

          <div className="deadline-list">
            {['Apple launch plan', 'Security audit', 'Design sprint sync'].map((item, index) => (
              <div key={item} className="deadline-item">
                <div className="deadline-dot" style={{ background: ['#4F46E5', '#06B6D4', '#10B981'][index] }} />
                <div>
                  <strong>{item}</strong>
                  <small>{['Tue 3:00 PM', 'Wed 11:00 AM', 'Thu 1:30 PM'][index]}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Recent tasks</h3>
            <button type="button" className="ghost-button">Open board</button>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.title} className="task-row">
                <div className="task-pill-wrap">
                  <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className={`status-tag ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span>
                </div>
                <strong>{task.title}</strong>
                <div className="task-meta">
                  <span><CalendarDays size={14} /> {task.due}</span>
                  <span><MessageSquareText size={14} /> 3 comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Activity timeline</h3>
            <button type="button" className="ghost-button">Live</button>
          </div>

          <div className="timeline-list">
            {activity.map((item) => (
              <div key={item.title} className="timeline-item">
                <div className="timeline-bullet" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-actions-grid">
        {['Create Task', 'Create Project', 'Invite Member'].map((action) => (
          <button key={action} type="button" className="quick-action">
            <Sparkles size={18} /> {action}
          </button>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;
