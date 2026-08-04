import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Plus, RefreshCw } from 'lucide-react';
import useTasks, { MOCK_PROJECTS } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskStatusBadge from '../components/TaskStatusBadge';
import { TASK_STATUSES, STATUS_LABELS } from '../taskConstants';

const TaskBoardPage = () => {
  const [projectId, setProjectId] = useState(MOCK_PROJECTS[0]?.id || '');
  const { board, boardLoading, error, fetchBoard, changeStatus } = useTasks();

  const loadBoard = useCallback(() => {
    if (projectId) fetchBoard({ projectId });
  }, [projectId, fetchBoard]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await changeStatus(taskId, status);
      loadBoard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tasks-page board-page">
      <div className="page-heading">
        <div>
          <h2>Task Board</h2>
          <p className="helper-copy">Drag between columns is simulated via the status menu on each card.</p>
        </div>
        <div className="page-heading-actions">
          <select
            className="board-project-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {MOCK_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Link to="/tasks" className="secondary-button compact">
            <List size={16} /> List
          </Link>
          <Link to="/tasks/new" className="primary-button compact">
            <Plus size={16} /> New Task
          </Link>
        </div>
      </div>

      <div className="board-toolbar">
        <span className="eyebrow secondary">Live board</span>
        <button type="button" className="ghost-button" onClick={loadBoard}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && <div className="form-banner danger">{error}</div>}

      {boardLoading && !Object.keys(board).length ? (
        <div className="tasks-grid-loading">Loading board...</div>
      ) : (
        <div className="board-columns">
          {TASK_STATUSES.map((status) => {
            const tasks = board[status] || [];
            return (
              <div key={status} className="board-column">
                <div className="board-column-head">
                  <TaskStatusBadge status={status} size="sm" />
                  <span className="board-column-count">{tasks.length}</span>
                </div>
                <div className="board-column-body">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {tasks.length === 0 && <div className="board-empty">No tasks</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskBoardPage;
