import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useProjects from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const project = await createProject(payload);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page project-page project-editor-page">
      <section className="hero-panel glass-card project-hero project-editor-hero">
        <div>
          <button type="button" className="secondary-button compact" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to projects
          </button>
          <p className="eyebrow secondary">Create project</p>
          <h1>Start a new project</h1>
          <p className="helper-copy">Define project details, timelines, and ownership in one place.</p>
        </div>
      </section>
      <section className="panel-block glass-card project-form-panel">
        <div className="project-form-panel-heading"><span>Project information</span><small>Fields marked by validation are required.</small></div>
        {error ? <p className="helper-copy project-feedback project-feedback-error">{error}</p> : null}
        <ProjectForm
          initialValues={{}}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
          submitting={submitting}
        />
      </section>
    </div>
  );
};

export default CreateProjectPage;
