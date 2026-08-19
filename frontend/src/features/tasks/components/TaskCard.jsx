import { Link } from 'react-router-dom';
import { CalendarDays, MessageSquareText, Paperclip, User } from 'lucide-react';
import { PRIORITY_LABELS, TYPE_LABELS, STATUS_LABELS, TASK_STATUS_TRANSITIONS } from '../taskConstants';

const PriorityTag = ({ priority }) => {
  const cls = String(priority || 'medium').toLowerCase();
  return <span className={`priority-tag ${cls}`}>{PRIORITY_LABELS[priority] || priority}</span>;
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};

const TaskCard = ({ task, onStatusChange, showProject = false }) => {
  const labels = task.labels || [];
  const assignee = task.assigneeName || task.primaryAssigneeName || (task.primaryAssigneeId ? 'Assigned user' : 'Unassigned');

  return (
    <div className="task-card">
      <div className="task-card-top">
        <Link to={`/tasks/${task.id}`} className="task-card-key">
          {task.taskKey || task.id}
        </Link>
        <PriorityTag priority={task.priority} />
      </div>

      <Link to={`/tasks/${task.id}`} className="task-card-title">
        {task.title}
      </Link>

      {labels.length > 0 && (
        <div className="task-card-labels">
          {labels.map((label) => (
            <span key={label.id || label._id} className="task-label-chip" style={{ background: `color-mix(in srgb, ${label.color} 18%, transparent)`, color: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-meta">
        <span title="Assignee">
          <User size={13} /> {assignee}
        </span>
        {task.dueDate && (
          <span title="Due date">
            <CalendarDays size={13} /> {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      <div className="task-card-footer">
        <span className="task-type-tag">{TYPE_LABELS[task.type] || task.type}</span>
        {showProject && task.projectName && <span className="task-project-tag">{task.projectName}</span>}
        <div className="task-card-actions">
          {task.commentCount !== undefined && (
            <span className="task-count-icon"><MessageSquareText size={13} /> {task.commentCount}</span>
          )}
          {task.attachmentCount !== undefined && (
            <span className="task-count-icon"><Paperclip size={13} /> {task.attachmentCount}</span>
          )}
          {onStatusChange && task.status && (
            <select
              className="task-status-select"
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              title="Change status"
            >
              {[task.status, ...(TASK_STATUS_TRANSITIONS[task.status] || [])].map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
