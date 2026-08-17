import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import reportService from '../services/reportService';
import PermissionGate from '../../roles/components/PermissionGate';
import ReportFilters from '../components/ReportFilters';

const ReportsPage = () => {
  const [report, setReport] = useState('status');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let active = true;
    const loaders = { status: reportService.taskStatus, progress: reportService.projectProgress, overdue: reportService.overdueTasks, workload: reportService.teamWorkload };
    const params = Object.fromEntries(searchParams.entries());
    loaders[report]({ ...params, page: 1, pageSize: 50 }).then((result) => { if (active) { setData(result || []); setError(null); } }).catch((requestError) => { if (active) setError(requestError); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [report, searchParams]);

  return <PermissionGate permission="REPORT_VIEW" fallback={<section className="panel-block glass-card"><h2>Reports access denied</h2><p className="helper-copy">Your account does not have report access.</p></section>}>
    <div className="dashboard-page"><section className="hero-panel glass-card"><div><p className="eyebrow secondary">Reports</p><h1>Delivery intelligence</h1><p className="helper-copy">Review project progress, task status, overdue work, and team workload.</p></div></section>
      <section className="panel-block glass-card"><ReportFilters /><div className="hero-actions"><button type="button" className={report === 'status' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setReport('status')}>Task status</button><button type="button" className={report === 'progress' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setReport('progress')}>Project progress</button><button type="button" className={report === 'overdue' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setReport('overdue')}>Overdue tasks</button><button type="button" className={report === 'workload' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setReport('workload')}>Team workload</button></div></section>
      <section className="panel-block glass-card"><h2>{loading ? 'Loading report...' : error ? 'Report unavailable' : 'Report results'}</h2>{error ? <p className="helper-copy">The report could not be loaded.</p> : !loading && !data.length ? <p className="helper-copy">No records match this report.</p> : <div className="task-list">{data.map((row, index) => <div className="task-row" key={row.userId || row.projectId || row.taskKey || row.status || row.priority || index}><strong>{row.name || row.taskKey || row.projectId || row.userId || row.status || row.priority}</strong><span>{row.count ?? row.completionPercentage ?? row.assigned ?? row.dueDate ?? ''}</span></div>)}</div>}</section>
    </div>
  </PermissionGate>;
};

export default ReportsPage;