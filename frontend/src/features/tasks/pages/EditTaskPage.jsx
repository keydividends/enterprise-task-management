import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';

const EditTaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const task = await taskService.getTask(taskId);
        if (!active) return;
        setInitialValues({
          title: task.title,
          description: task.description || '',
          projectId: task.projectId,
          sprintId: task.sprintId || '',
          epicId: task.epicId || '',
          type: task.type || 'TASK',
          status: task.status || 'TODO',
          priority: task.priority || 'MEDIUM',
          primaryAssigneeId: task.primaryAssigneeId || '',
          storyPoints: task.storyPoints ?? '',
          startDate: task.startDate ? String(task.startDate).slice(0, 10) : '',
          dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
        });
      } catch (err) {
        if (active) setError(err.response?.data?.message || err.message || 'Failed to load task.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [taskId]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await taskService.updateTask(taskId, payload);
      navigate(`/tasks/${taskId}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="tasks-grid-loading">Loading task...</div>;
  if (error) return <div className="form-banner danger">{error}</div>;

  return (
    <div className="task-edit-page">
      <div className="page-heading">
        <div>
          <h2>Edit Task</h2>
          <p className="helper-copy">Update the task details below.</p>
        </div>
        <button type="button" className="secondary-button compact" onClick={() => navigate(`/tasks/${taskId}`)}>
          <ArrowLeft size={16} /> Back to task
        </button>
      </div>

      <div className="glass-card task-form-card">
        <div className="form-card-heading">
          <strong>Edit task</strong>
        </div>
        <TaskForm initialValues={initialValues} submitLabel="Save changes" loading={saving} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default EditTaskPage;
