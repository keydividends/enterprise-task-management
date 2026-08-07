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
    <div className="dashboard-page project-page project-list-page">
      <section className="hero-panel glass-card project-hero">
        <div>
          <p className="eyebrow secondary">Project management</p>
          <h1>Manage your projects</h1>
          <p className="helper-copy">Create, search, and oversee active, planned, and archived projects from one place.</p>
        </div>
        <div className="hero-score-panel project-score-panel">
          <div className="score-ring">
            <div className="score-ring-inner"><span>{summary.count}</span></div>
          </div>
          <div className="score-copy">
            <strong>{summary.active} active projects</strong>
            <small>{summary.count} total projects</small>
          </div>
        </div>
      </section>

      <section className="content-grid project-list-layout">
        <div className="panel-block glass-card project-directory-panel">
          <div className="panel-header project-directory-header">
            <div>
              <p className="project-section-kicker">Workspace portfolio</p>
              <h3>Projects</h3>
            </div>
            <div className="button-row project-toolbar">
              <button type="button" className="secondary-button compact" onClick={() => refresh(search)}>
                <RefreshCw size={14} /> Refresh
              </button>
              <Link to="/projects/create" className="primary-button compact" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> Create project
              </Link>
            </div>
          </div>

          <div className="field-group project-search-field">
            <span>Find a project</span>
            <div className="input-wrap project-search-wrap">
              <Search size={16} />
              <input value={search} onChange={handleSearch} placeholder="Search by project name or key" />
            </div>
          </div>

          {loading ? <p className="helper-copy project-feedback">Loading projects...</p> : null}
          {error ? <p className="helper-copy project-feedback project-feedback-error">{error}</p> : null}
          {!loading && projects.length === 0 ? <div className="empty-state project-empty-state">No projects found.</div> : null}

          <div className="project-card-list">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectListPage;
