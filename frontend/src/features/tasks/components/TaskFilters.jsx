import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES } from '../taskConstants';
import { MOCK_PROJECTS, MOCK_SPRINTS, getProjectMembers } from '../hooks/useTasks';

const defaultFilters = {
  search: '',
  projectId: '',
  sprintId: '',
  status: '',
  priority: '',
  type: '',
  assigneeId: '',
};

const TaskFilters = ({ initialFilters = {}, onChange, projects = MOCK_PROJECTS }) => {
  const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (onChange) onChange(next);
  };

  const reset = () => {
    setFilters(defaultFilters);
    if (onChange) onChange(defaultFilters);
  };

  const projectMembers = filters.projectId ? getProjectMembers(filters.projectId) : [];
  const projectSprints = filters.projectId ? MOCK_SPRINTS.filter((s) => s.projectId === filters.projectId) : [];

  return (
    <div className="task-filters glass-card">
      <div className="task-filters-row">
        <div className="filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>

        <select value={filters.projectId} onChange={(e) => update('projectId', e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={filters.status} onChange={(e) => update('status', e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select value={filters.priority} onChange={(e) => update('priority', e.target.value)}>
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">All types</option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={filters.sprintId} onChange={(e) => update('sprintId', e.target.value)} disabled={!filters.projectId}>
          <option value="">All sprints</option>
          {projectSprints.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={filters.assigneeId} onChange={(e) => update('assigneeId', e.target.value)} disabled={!filters.projectId}>
          <option value="">Any assignee</option>
          {projectMembers.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>

        <button type="button" className="filter-reset-btn" onClick={reset} title="Reset filters">
          <X size={16} /> Reset
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
