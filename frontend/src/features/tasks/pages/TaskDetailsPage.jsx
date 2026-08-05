import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  Flag,
  MessageSquareText,
  Paperclip,
  Trash2,
  User,
} from 'lucide-react';
import taskService from '../services/taskService';
import TaskStatusBadge from '../components/TaskStatusBadge';
import ChecklistPanel from '../components/ChecklistPanel';
import { PRIORITY_LABELS, TYPE_LABELS, STATUS_LABELS, TASK_STATUSES, TASK_PRIORITIES } from '../taskConstants';
import { getUserName, getProjectMembers } from '../hooks/useTasks';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTask(taskId);
      setTask(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load task.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleStatusChange = async (status) => {
    setBusy(true);
    try {
      const updated = await taskService.changeStatus(taskId, status);
      setTask((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
};

  const handlePriorityChange = async (priority) => {
    setBusy(true);
    try {
      const updated = await taskService.changePriority(taskId, priority);
      setTask((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (userId) => {
    setBusy(true);
    try {
      const updated = userId
        ? await taskService.assignTask(taskId, userId)
        : await taskService.unassignTask(taskId);
      setTask((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      window.location.href = '/tasks';
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="tasks-grid-loading">Loading task...</div>;
  if (error) return <div className="form-banner danger">{error}</div>;
  if (!task) return <div className="empty-state glass-card">Task not found.</div>;

  const members = getProjectMembers(task.projectId);
  const labels = task.labels || [];
  const checklists = task.checklists || [];
  const history = task.history || [];

  return (
    <div className="task-detail-page">
      <div className="task-detail-top">
        <Link to="/tasks" className="secondary-button compact">
          <ArrowLeft size={16} /> Back to tasks
        </Link>
        <div className="task-detail-actions">
          <Link to={`/tasks/${task.id}/edit`} className="secondary-button compact">
            <Edit size={16} /> Edit
          </Link>
          <button type="button" className="ghost-button danger" onClick={handleDelete}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="task-detail-grid">
        <div className="task-detail-main glass-card">
          <div className="task-detail-head">
            <span className="task-detail-key">{task.taskKey}</span>
            <TaskStatusBadge status={task.status} />
          </div>
          <h1>{task.title}</h1>
          <p className="task-detail-desc">{task.description || 'No description provided.'}</p>

          {labels.length > 0 && (
            <div className="task-detail-labels">
              {labels.map((label) => (
                <span key={label.id} className="task-label-chip" style={{ background: `color-mix(in srgb, ${label.color} 18%, transparent)`, color: label.color }}>
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="task-detail-meta-grid">
            <div className="meta-cell">
              <span className="meta-label"><Flag size={14} /> Priority</span>
              <select value={task.priority} onChange={(e) => handlePriorityChange(e.target.value)} disabled={busy}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div className="meta-cell">
              <span className="meta-label"><User size={14} /> Assignee</span>
              <select value={task.primaryAssigneeId || ''} onChange={(e) => handleAssign(e.target.value)} disabled={busy}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>
            <div className="meta-cell">
              <span className="meta-label"><CalendarDays size={14} /> Due date</span>
              <span className="meta-value">{formatDate(task.dueDate)}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Type</span>
              <span className="meta-value">{TYPE_LABELS[task.type] || task.type}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Story points</span>
              <span className="meta-value">{task.storyPoints ?? '—'}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Reporter</span>
              <span className="meta-value">{getUserName(task.reporterId)}</span>
            </div>
          </div>

          <div className="task-status-transition">
            <span className="meta-label">Move to</span>
            <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={busy}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="task-detail-side">
          <div className="glass-card task-detail-panel">
            <h4>Details</h4>
            <div className="detail-row"><span>Assignee</span><strong>{getUserName(task.primaryAssigneeId)}</strong></div>
            <div className="detail-row"><span>Reporter</span><strong>{getUserName(task.reporterId)}</strong></div>
            <div className="detail-row"><span>Created</span><strong>{formatDate(task.createdAt)}</strong></div>
            <div className="detail-row"><span>Updated</span><strong>{formatDate(task.updatedAt)}</strong></div>
          </div>

          <div className="glass-card task-detail-panel">
            <h4>Activity</h4>
            {history.length === 0 ? (
              <p className="empty-hint">No history yet.</p>
            ) : (
              <div className="history-list">
                {history.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <strong>{entry.field}</strong>
                    <span>{String(entry.oldValue ?? '—')} → {String(entry.newValue ?? '—')}</span>
                    <small>{formatDate(entry.changedAt)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card task-detail-panel">
        <ChecklistPanel taskId={task.id} checklists={checklists} onChange={(next) => setTask((prev) => ({ ...prev, checklists: next }))} />
      </div>

      <div className="task-detail-slots">
        <div className="glass-card task-detail-panel">
          <h4><MessageSquareText size={16} /> Comments</h4>
          <p className="empty-hint">Comments slot — ready for the collaboration module.</p>
        </div>
        <div className="glass-card task-detail-panel">
          <h4><Paperclip size={16} /> Attachments</h4>
          <p className="empty-hint">Attachments slot — ready for the collaboration module.</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
