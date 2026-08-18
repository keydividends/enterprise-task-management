import { useSearchParams } from 'react-router-dom';

const ReportFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return <div className="report-filters" aria-label="Report filters">
    <label>Project ID<input value={searchParams.get('projectId') || ''} onChange={(event) => update('projectId', event.target.value)} /></label>
    <label>Team ID<input value={searchParams.get('teamId') || ''} onChange={(event) => update('teamId', event.target.value)} /></label>
    <label>From date<input type="date" value={searchParams.get('fromDate') || ''} onChange={(event) => update('fromDate', event.target.value)} /></label>
    <label>To date<input type="date" value={searchParams.get('toDate') || ''} onChange={(event) => update('toDate', event.target.value)} /></label>
  </div>;
};

export default ReportFilters;