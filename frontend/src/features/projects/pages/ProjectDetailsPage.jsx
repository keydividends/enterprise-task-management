import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import projectService from '../services/projectService';
import ProjectMemberManager from '../components/ProjectMemberManager';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasProjectPermission } from '../utils/projectPermissions';

const TASK_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'QA', 'DONE', 'CANCELLED'];

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const canUpdate = hasProjectPermission(user, 'PROJECT_UPDATE');
  const canDelete = hasProjectPermission(user, 'PROJECT_DELETE');
  const canManageMembers = hasProjectPermission(user, 'PROJECT_MANAGE_MEMBERS');

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
    <div className="dashboard-page project-page project-details-page">
      <section className="hero-panel glass-card project-hero project-details-hero">
        <div>
          <button type="button" className="secondary-button compact" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to projects
          </button>
          <p className="eyebrow secondary">Project detail</p>
          <h1>{project?.name || 'Project detail'}</h1>
          <p className="helper-copy">Review project status, dates, and member assignments.</p>
        </div>
        <div className="button-row project-detail-actions">
          <button type="button" className="secondary-button compact" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
          {canUpdate ? <Link to={`/projects/${projectId}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit</Link> : null}
          {canDelete ? <button type="button" className="ghost-button" onClick={handleDelete}>Archive</button> : null}
        </div>
      </section>

      {error ? <p className="helper-copy project-feedback project-feedback-error">{error}</p> : null}

      {loading ? (
        <div className="panel-block glass-card project-state-card">Loading project details...</div>
      ) : project ? (
        <section className="content-grid project-details-grid">
          <div className="panel-block glass-card project-overview-card">
            <div className="panel-header"><div><p className="project-section-kicker">At a glance</p><h3>Overview</h3></div></div>
            <div className="project-overview-metrics">
              <div><span>Project key</span><strong>{project.key}</strong></div>
              <div><span>Status</span><strong>{project.status}</strong></div>
              <div><span>Priority</span><strong>{project.priority}</strong></div>
              <div><span>Manager</span><strong>{project.projectManagerEmployeeId || project.projectManagerId || 'Unassigned'}</strong></div>
              <div><span>Start date</span><strong>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</strong></div>
              <div><span>Target end date</span><strong>{project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'Not set'}</strong></div>
            </div>
            <div className="project-description-block"><span>Description</span><p>{project.description || 'No description provided'}</p></div>
          </div>
          <div className="panel-block glass-card project-summary-card">
            <div className="panel-header"><div><p className="project-section-kicker">Delivery pulse</p><h3>Task summary</h3></div></div>
            {summary ? (
              <>
                <div className="project-summary-list">
                  {TASK_STATUSES.map((status) => (
                  <div key={status} className="task-row project-summary-row">
                    <span>{status}</span>
                    <strong>{summary[status] ?? 0}</strong>
                  </div>
                  ))}
                </div>
                {Object.keys(summary).length === 0 ? (
                  <p className="helper-copy">No tasks have been created for this project yet.</p>
                ) : null}
              </>
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
            canManageMembers={canManageMembers}
          />
        </section>
      ) : (
        <div className="panel-block glass-card project-state-card">Project not found.</div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
