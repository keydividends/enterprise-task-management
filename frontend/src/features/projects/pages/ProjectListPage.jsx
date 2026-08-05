import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Search } from 'lucide-react';
import useProjects from '../hooks/useProjects';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refresh } = useProjects();
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const summary = useMemo(() => ({
    count: projects.length,
    active: projects.filter((project) => project.status === 'ACTIVE').length,
  }), [projects]);

  const handleSearch = async (event) => {
    const nextValue = event.target.value;
    setSearch(nextValue);
    await refresh(nextValue);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Archive this project?')) return;
    setBusyId(projectId);
    try {
      await projectService.deleteProject(projectId);
      await refresh(search);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Project management</p>
          <h1>Manage your projects</h1>
          <p className="helper-copy">Create, search, and oversee active, planned, and archived projects from one place.</p>
        </div>
        <div className="hero-score-panel">
          <div className="score-ring">
            <div className="score-ring-inner"><span>{summary.count}</span></div>
          </div>
          <div className="score-copy">
            <strong>{summary.active} active projects</strong>
            <small>{summary.count} total projects</small>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-block glass-card" style={{ minHeight: '280px' }}>
          <div className="panel-header">
            <h3>Projects</h3>
            <div className="button-row">
              <button type="button" className="secondary-button compact" onClick={() => refresh(search)}>
                <RefreshCw size={14} /> Refresh
              </button>
              <Link to="/projects/create" className="primary-button compact" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> Create project
              </Link>
            </div>
          </div>

          <div className="field-group">
            <span>Search</span>
            <div className="input-wrap">
              <Search size={16} />
              <input value={search} onChange={handleSearch} placeholder="Search by project name or key" />
            </div>
          </div>

          {loading ? <p className="helper-copy">Loading projects...</p> : null}
          {error ? <p className="helper-copy">{error}</p> : null}
          {!loading && projects.length === 0 ? <div className="empty-state">No projects found.</div> : null}

          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectListPage;
