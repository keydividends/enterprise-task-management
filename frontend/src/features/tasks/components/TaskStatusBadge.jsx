import { STATUS_LABELS, STATUS_COLORS } from "../taskConstants";

const TaskStatusBadge = ({ status, size = "md" }) => {
  const color = STATUS_COLORS[status] || "var(--text-soft)";
  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)`, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      <span className="status-dot" style={{ background: color }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default TaskStatusBadge;
