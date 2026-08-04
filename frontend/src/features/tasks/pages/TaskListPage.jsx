import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Kanban, Plus, Search } from 'lucide-react';
import useTasks from '../hooks/useTasks';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import TaskStatusBadge from '../components/TaskStatusBadge';
import { PRIORITY_ORDER } from '../taskConstants';

const TaskListPage = () => {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { tasks = [], loading, error, pagination, fetchTasks } = useTasks();

  useEffect(() => {
    const params = {
      page,
      pageSize,
      sortBy,
      sortOrder,
      ...filters,
    };
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) delete params[key];
    });
    fetchTasks(params);
  }, [filters, page, sortBy, sortOrder, fetchTasks]);

  const handleFiltersChange = useCallback((next) => {
    setFilters(next);
    setPage(1);
  }, []);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalPages = pagination?.totalPages || 0;
  const totalItems = pagination?.totalItems || 0;

  return (
    <div className="tasks-page">
      <div className="page-heading">
        <div>
          <h2>Tasks</h2>
          <p className="helper-copy">{totalItems} tasks in this view</p>
        </div>
        <div className="page-heading-actions">
          <Link to="/tasks/board" className="secondary-button compact">
            <Kanban size={16} /> Board
          </Link>
          <Link to="/tasks/new" className="primary-button compact">
            <Plus size={16} /> New Task
          </Link>
        </div>
      </div>

      <TaskFilters initialFilters={filters} onChange={handleFiltersChange} />

      <div className="tasks-toolbar glass-card">
        <button type="button" className="ghost-button" onClick={() => toggleSort('createdAt')}>
          <ArrowUpDown size={15} /> Created
        </button>
        <button type="button" className="ghost-button" onClick={() => toggleSort('dueDate')}>
          <ArrowUpDown size={15} /> Due date
        </button>
        <button type="button" className="ghost-button" onClick={() => toggleSort('priority')}>
          <ArrowUpDown size={15} /> Priority
        </button>
        <span className="tasks-toolbar-spacer" />
        <span className="tasks-sort-hint">Sort order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
      </div>

      {error && <div className="form-banner danger">{error}</div>}

      {loading ? (
        <div className="tasks-grid-loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state glass-card">
          <Search size={28} />
          <p className="empty-hint">No tasks match the current filters.</p>
          <Link to="/tasks/new" className="primary-button compact">Create a task</Link>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showProject
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="ghost-button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            className="ghost-button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskListPage;
