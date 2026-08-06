import { useEffect, useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../taskConstants';
import { MOCK_PROJECTS, MOCK_SPRINTS, getProjectMembers } from '../hooks/useTasks';
import { getNetWorkError } from '../utils/formErrors';

const defaultValues = {
  title: '',
  description: '',
  projectId: '',
  sprintId: '',
  epicId: '',
  type: 'TASK',
  status: 'TODO',
  priority: 'MEDIUM',
  primaryAssigneeId: '',
  storyPoints: '',
  startDate: '',
  dueDate: '',
};

// Stable reference so the default prop value never changes between renders.
const EMPTY_INITIAL = {};

const hasDifferences = (prev, next) =>
  Object.keys(next).some((key) => prev[key] !== next[key]);

const TaskForm = ({ initialValues = EMPTY_INITIAL, submitLabel = 'Save task', onSubmit, loading = false }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Only update state when initialValues actually introduces a change, so the
    // effect does not re-trigger on every render (prevents infinite update loop).
    setValues((prev) => {
      if (Object.keys(initialValues).length === 0 || !hasDifferences(prev, initialValues)) {
        return prev;
      }
      return { ...defaultValues, ...prev, ...initialValues };
    });
  }, [initialValues]);

  const projectMembers = values.projectId ? getProjectMembers(values.projectId) : [];
  const projectSprints = values.projectId ? MOCK_SPRINTS.filter((s) => s.projectId === values.projectId) : [];

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!values.projectId) nextErrors.projectId = 'Project is required.';
    if (values.storyPoints !== '' && (Number.isNaN(Number(values.storyPoints)) || Number(values.storyPoints) < 0)) {
      nextErrors.storyPoints = 'Story points must be a non-negative number.';
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: values.title.trim(),
      description: values.description,
      projectId: values.projectId,
      sprintId: values.sprintId || undefined,
      epicId: values.epicId || undefined,
      type: values.type,
      status: values.status,
      priority: values.priority,
      primaryAssigneeId: values.primaryAssigneeId || undefined,
      storyPoints: values.storyPoints === '' ? undefined : Number(values.storyPoints),
      startDate: values.startDate || undefined,
      dueDate: values.dueDate || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      const message = getNetWorkError(error);
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="task-title">Title <span className="req">*</span></label>
        <input
          id="task-title"
          type="text"
          placeholder="e.g. Implement JWT protected routes"
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          rows={4}
          placeholder="Add more detail..."
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
        />
      </div>

      <div className="split-fields">
        <div className="field-group">
          <label htmlFor="task-project">Project <span className="req">*</span></label>
          <select
            id="task-project"
            value={values.projectId}
            onChange={(e) => {
              setField('projectId', e.target.value);
              setField('sprintId', '');
              setField('primaryAssigneeId', '');
            }}
          >
            <option value="">Select project...</option>
            {MOCK_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <p className="field-error">{errors.projectId}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="task-type">Type</label>
          <select id="task-type" value={values.type} onChange={(e) => setField('type', e.target.value)}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="split-fields">
        <div className="field-group">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" value={values.status} onChange={(e) => setField('status', e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" value={values.priority} onChange={(e) => setField('priority', e.target.value)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="split-fields">
        <div className="field-group">
          <label htmlFor="task-assignee">Assignee</label>
          <select
            id="task-assignee"
            value={values.primaryAssigneeId}
            onChange={(e) => setField('primaryAssigneeId', e.target.value)}
            disabled={!values.projectId}
          >
            <option value="">Unassigned</option>
            {projectMembers.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="task-sprint">Sprint</label>
          <select
            id="task-sprint"
            value={values.sprintId}
            onChange={(e) => setField('sprintId', e.target.value)}
            disabled={!values.projectId}
          >
            <option value="">No sprint</option>
            {projectSprints.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="split-fields">
        <div className="field-group">
          <label htmlFor="task-story-points">Story points</label>
          <input
            id="task-story-points"
            type="number"
            min="0"
            placeholder="5"
            value={values.storyPoints}
            onChange={(e) => setField('storyPoints', e.target.value)}
          />
          {errors.storyPoints && <p className="field-error">{errors.storyPoints}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="task-due-date">Due date</label>
          <input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            onChange={(e) => setField('dueDate', e.target.value)}
          />
        </div>
      </div>

      {errors.general && <div className="form-banner danger">{errors.general}</div>}

      <div className="task-form-actions">
        <button type="button" className="secondary-button" onClick={() => navigate(-1)} disabled={loading}>
          <ArrowLeft size={16} /> Cancel
        </button>
        <button type="submit" className="primary-button compact" disabled={loading}>
          <Save size={16} /> {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
