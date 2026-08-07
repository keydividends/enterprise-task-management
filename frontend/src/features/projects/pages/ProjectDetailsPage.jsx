import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import projectService from '../services/projectService';
import ProjectMemberManager from '../components/ProjectMemberManager';

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const projectData = await projectService.getProject(projectId);
        const membersResult = await projectService.listProjectMembers(projectId);
        const summaryData = await projectService.getProjectTaskSummary(projectId);
        setProject(projectData);
        setMembers(membersResult?.items || membersResult || []);
        setSummary(summaryData);
        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleDelete = async () => {
    if (!window.confirm('Archive this project?')) return;
    try {
      await projectService.deleteProject(projectId);
      navigate('/projects');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to archive project.');
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <button type="button" className="secondary-button compact" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to projects
          </button>
          <p className="eyebrow secondary">Project detail</p>
          <h1>{project?.name || 'Project detail'}</h1>
          <p className="helper-copy">Review project status, dates, and member assignments.</p>
        </div>
        <div className="button-row">
          <button type="button" className="secondary-button compact" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to={`/projects/${projectId}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>
            Edit
          </Link>
          <button type="button" className="ghost-button" onClick={handleDelete}>
            Archive
          </button>
        </div>
      </section>

      {error ? <p className="helper-copy" style={{ color: '#ef4444' }}>{error}</p> : null}

      {loading ? (
        <div className="panel-block glass-card">Loading project details...</div>
      ) : project ? (
        <section className="content-grid">
          <div className="panel-block glass-card">
            <div className="panel-header"><h3>Overview</h3></div>
            <p><strong>Key:</strong> {project.key}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Priority:</strong> {project.priority}</p>
            <p><strong>Manager:</strong> {project.projectManagerId || 'Unassigned'}</p>
            <p><strong>Start date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
            <p><strong>Target end date:</strong> {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'Not set'}</p>
            <p><strong>Description:</strong> {project.description || 'No description provided'}</p>
          </div>
          <div className="panel-block glass-card">
            <div className="panel-header"><h3>Task summary</h3></div>
            {summary ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.entries(summary).map(([status, count]) => (
                  <div key={status} className="task-row">
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="helper-copy">No summary available.</p>
            )}
          </div>
          <ProjectMemberManager
            projectId={projectId}
            members={members}
            onMembersChange={setMembers}
            onMessage={() => {} }
            onError={setError}
          />
        </section>
      ) : (
        <div className="panel-block glass-card">Project not found.</div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
