import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit,
  Flag,
  Loader2,
  MessageSquareText,
  Paperclip,
  Trash2,
  User,
  X,
} from 'lucide-react';
import CommentsPanel from '../../comments/components/CommentsPanel';
import AttachmentsPanel from '../../comments/components/AttachmentsPanel';
import '../../comments/components/collaboration.css';
import taskService from '../services/taskService';
import TaskStatusBadge from '../components/TaskStatusBadge';
import ChecklistPanel from '../components/ChecklistPanel';
import { PRIORITY_LABELS, TYPE_LABELS, STATUS_LABELS, TASK_STATUSES, TASK_PRIORITIES } from '../taskConstants';
import { MOCK_USERS, fetchProjectMembers, fetchProjectSprints } from '../hooks/useTasks';
import axiosClient from '../../../api/axiosClient';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Resolve a userId to a display name using a pre-built userMap.
// Falls back to MOCK_USERS, then to 'Unknown'.
const resolveName = (userId, userMap) => {
  if (!userId) return 'Unassigned';
  const str = String(userId);
  if (userMap[str]) return userMap[str];
  const mock = MOCK_USERS.find((u) => u.id === str);
  return mock ? mock.fullName : 'Unknown';
};

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [userMap, setUserMap] = useState({});

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTask(taskId);
      setTask(data);
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      if (status === 403 || code === 'PERMISSION_DENIED') {
        setError('You do not have permission to view this task.');
      } else if (status === 404 || code === 'TASK_NOT_FOUND') {
        setError('Task not found.');
      } else if (status >= 500 || !err.response) {
        setError('Unable to load task. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load task.');
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Build a userId -> fullName map from the real users API for reporter/assignee display.
  useEffect(() => {
    axiosClient.get('/users', { params: { pageSize: 200 } })
      .then((res) => {
        const users = res.data?.data?.items || res.data?.data || res.data?.items || [];
        const map = {};
        users.forEach((u) => {
          const uid = u.id || u._id;
          if (uid) map[String(uid)] = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
        });
        setUserMap(map);
      })
      .catch(() => { /* silently fall back to mock */ });
  }, []);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  useEffect(() => {
    if (task?.projectId) fetchProjectMembers(task.projectId).then(setMembers);
  }, [task?.projectId]);

  useEffect(() => {
    if (task?.projectId) fetchProjectSprints(task.projectId).then(setSprints);
  }, [task?.projectId]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

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

  const openDeleteModal = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (deleting) return; // prevent multiple delete requests
    setDeleting(true);
    setDeleteError(null);
    try {
      await taskService.deleteTask(taskId);
      setShowDeleteModal(false);
      showToast('Task deleted successfully.');
      navigate('/tasks');
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="tasks-grid-loading">Loading task...</div>;
  if (error) return <div className="form-banner danger">{error}</div>;
  if (!task) return <div className="empty-state glass-card">Task not found.</div>;

const labels = task.labels || [];
  const checklists = task.checklists || [];
  const history = task.history || [];

  // Resolve a userId to a display name, preferring the real users map.
  const getUserName = (userId) => resolveName(userId, userMap);
  const formatHistoryValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '—';

    const normalizedField = String(field).toLowerCase();
    if (normalizedField === 'sprintid') {
      const sprint = sprints.find((item) => String(item.id || item._id) === String(value));
      return sprint?.name || String(value);
    }
    if (normalizedField === 'primaryassigneeid' || normalizedField === 'assigneeid') {
      return getUserName(value);
    }
    return String(value);
  };

  return (
    <div className="task-detail-page">
      {toast && (
        <div className="toast-notice form-banner success">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      <div className="task-detail-top">
        <button type="button" className="secondary-button compact" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={16} /> Back to tasks
        </button>
        <div className="task-detail-actions">
          <Link to={`/tasks/${task.id}/edit`} className="secondary-button compact">
            <Edit size={16} /> Edit
          </Link>
          <button type="button" className="ghost-button danger" onClick={openDeleteModal}>
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
                <span key={label.id || label._id} className="task-label-chip" style={{ background: `color-mix(in srgb, ${label.color} 18%, transparent)`, color: label.color }}>
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
                    <span>{formatHistoryValue(entry.field, entry.oldValue)} → {formatHistoryValue(entry.field, entry.newValue)}</span>
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

      <div className="collab-slots">
        <div className="glass-card collab-card">
          <CommentsPanel taskId={task.id} />
        </div>
        <div className="glass-card collab-card">
          <AttachmentsPanel taskId={task.id} />
        </div>
      </div>

{showDeleteModal && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeDeleteModal}>
          <div
            className="modal-card glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="modal-icon danger">
              <AlertTriangle size={22} />
            </div>

            <h3 id="delete-modal-title">Delete Task</h3>
            <p className="modal-message">
              Are you sure you want to delete this task? This action can't be undone.
            </p>

            <div className="modal-task-summary">
              <span className="modal-task-key">{task.taskKey}</span>
              <span className="modal-task-title">{task.title}</span>
            </div>

            {deleteError && <div className="form-banner danger">{deleteError}</div>}

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeDeleteModal} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="primary-button danger-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 size={16} className="spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Delete Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailsPage;
