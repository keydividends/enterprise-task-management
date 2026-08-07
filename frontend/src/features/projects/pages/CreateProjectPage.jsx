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
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <button type="button" className="secondary-button compact" onClick={() => navigate('/projects')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to projects
          </button>
          <p className="eyebrow secondary">Create project</p>
          <h1>Start a new project</h1>
          <p className="helper-copy">Define project details, timelines, and ownership in one place.</p>
        </div>
      </section>
      <section className="panel-block glass-card">
        {error ? <p className="helper-copy" style={{ color: '#ef4444' }}>{error}</p> : null}
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
