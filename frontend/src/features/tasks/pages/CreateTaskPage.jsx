import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const task = await taskService.createTask(payload);
      navigate(`/tasks/${task.id}`);
    } catch (err) {
      const code = err.response?.data?.code;
      const status = err.response?.status;
      if (code === 'PROJECT_ACCESS_DENIED' || status === 403) {
        setError('You do not have access to this project.');
      } else if (code === 'PROJECT_NOT_FOUND' || status === 404) {
        setError('Project not found.');
      } else if (status >= 500 || !err.response) {
        setError('Unable to verify project access. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create task.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-edit-page">
      <div className="page-heading">
        <div>
          <h2>Create Task</h2>
          <p className="helper-copy">Fill in the details to create a new task.</p>
        </div>
        <button type="button" className="secondary-button compact" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={16} /> Back to tasks
        </button>
      </div>

      {error && <div className="form-banner danger">{error}</div>}

      <div className="glass-card task-form-card">
        <div className="form-card-heading">
          <div className="reset-illustration"><Plus size={22} /></div>
          <strong>New task</strong>
        </div>
        <TaskForm submitLabel="Create task" loading={saving} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateTaskPage;
