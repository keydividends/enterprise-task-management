import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import projectService from '../services/projectService';
import ProjectForm from '../components/ProjectForm';

const EditProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const result = await projectService.getProject(projectId);
        setProject(result);
        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load project.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      await projectService.updateProject(projectId, payload);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="panel-block glass-card">Loading project...</div>;
  }

  if (!project) {
    return <div className="panel-block glass-card">Project not found.</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Edit project</p>
          <h1>{project.name}</h1>
          <p className="helper-copy">Update project details and timelines.</p>
        </div>
      </section>
      <section className="panel-block glass-card">
        {error ? <p className="helper-copy" style={{ color: '#ef4444' }}>{error}</p> : null}
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
