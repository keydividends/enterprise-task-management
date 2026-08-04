import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      const task = await taskService.createTask(payload);
      navigate(`/tasks/${task.id}`);
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
        <Link to="/tasks" className="secondary-button compact">
          <ArrowLeft size={16} /> Back to tasks
        </Link>
      </div>

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
