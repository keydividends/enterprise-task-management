import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Plus, RefreshCw, Loader2 } from 'lucide-react';
import useTasks, { MOCK_PROJECTS, fetchProjects } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskStatusBadge from '../components/TaskStatusBadge';
import { TASK_STATUSES } from '../taskConstants';

const TaskBoardPage = () => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [projectId, setProjectId] = useState(MOCK_PROJECTS[0]?.id || '');

  useEffect(() => {
    fetchProjects().then((list) => {
      setProjects(list);
      if (list.length && !projectId) setProjectId(list[0].id);
    });
  }, []);
  const { board, boardLoading, error, fetchBoard, changeStatus } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const buildBoardParams = useCallback(() => ({ projectId }), [projectId]);

  const loadBoard = useCallback(async () => {
    if (!projectId) return;
    await fetchBoard(buildBoardParams());
  }, [projectId, fetchBoard, buildBoardParams]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleStatusChange = async (taskId, status) => {
    setRefreshing(true);
    setToast(null);
    try {
      await changeStatus(taskId, status);
      const result = await fetchBoard(buildBoardParams());
      if (!result) setToast(error || 'Failed to refresh board after status change.');
    } catch (err) {
      console.error(err);
      setToast(err.response?.data?.message || err.message || 'Failed to change status.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!projectId) return;
    // The loading state is driven by the actual API request lifecycle: it is
    // set true before the request starts and cleared only after the request
    // settles (success or failure) in the finally block.
    setRefreshing(true);
    setToast(null);
    try {
      const result = await fetchBoard(buildBoardParams());
      if (!result) {
        setToast(error || 'Failed to refresh board.');
      }
    } catch (err) {
      setToast(err.response?.data?.message || err.message || 'Failed to refresh board.');
    } finally {
      setRefreshing(false);
    }
  }, [projectId, fetchBoard, error, buildBoardParams]);

  // Auto-dismiss the toast after a fixed delay. Kept separate from the request
  // lifecycle so the loading spinner is not artificially tied to a timeout.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
            {projects.map((p) => (
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
        <button
          type="button"
          className="ghost-button"
          onClick={handleRefresh}
          disabled={refreshing || boardLoading}
        >
          {refreshing ? (
            <>
              <Loader2 size={15} className="spin" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw size={15} /> Refresh
            </>
          )}
        </button>
      </div>

      {toast && <div className="toast-notice form-banner danger">{toast}</div>}
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

