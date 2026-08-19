import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import projectService from '../services/projectService';
import ProjectForm from '../components/ProjectForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasProjectPermission } from '../utils/projectPermissions';
import ProjectToast from '../components/ProjectToast';
import useProjectToasts from '../hooks/useProjectToasts';

const EditProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, dismiss, error: showError } = useProjectToasts();

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const result = await projectService.getProject(projectId);
        setProject(result);
      } catch (err) {
        showError(err?.response?.data?.message || err?.message || 'Unable to load project.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, showError]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await projectService.updateProject(projectId, payload);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || 'Unable to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <><div className="project-toast-stack">{toasts.map((toast) => <ProjectToast key={toast.id} toast={toast} onDismiss={dismiss} />)}</div><div className="panel-block glass-card project-state-card">Loading project...</div></>;
  }

  if (!hasProjectPermission(user, 'PROJECT_UPDATE')) {
    return <><div className="project-toast-stack">{toasts.map((toast) => <ProjectToast key={toast.id} toast={toast} onDismiss={dismiss} />)}</div><div className="panel-block glass-card project-state-card">You do not have permission to edit projects.</div></>;
  }

  if (!project) {
    return <><div className="project-toast-stack">{toasts.map((toast) => <ProjectToast key={toast.id} toast={toast} onDismiss={dismiss} />)}</div><div className="panel-block glass-card project-state-card">Project not found.</div></>;
  }

  return (
    <div className="dashboard-page project-page project-editor-page">
      <div className="project-toast-stack">{toasts.map((toast) => <ProjectToast key={toast.id} toast={toast} onDismiss={dismiss} />)}</div>
      <section className="hero-panel glass-card project-hero project-editor-hero">
        <div>
          <button type="button" className="secondary-button compact" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to projects
          </button>
          <p className="eyebrow secondary">Edit project</p>
          <h1>{project.name}</h1>
          <p className="helper-copy">Update project details and timelines.</p>
        </div>
      </section>
      <section className="panel-block glass-card project-form-panel">
        <div className="project-form-panel-heading"><span>Project information</span><small>Keep delivery details current for your team.</small></div>
        <ProjectForm
          initialValues={project}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${projectId}`)}
          submitting={submitting}
        />
      </section>
    </div>
  );
};

export default EditProjectPage;
