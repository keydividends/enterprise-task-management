import { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';

const defaultWidgets = [
  { widgetType: 'SUMMARY', title: 'Summary', position: { x: 0, y: 0, width: 12, height: 4 }, isVisible: true },
  { widgetType: 'TASK_STATUS', title: 'Task status', position: { x: 0, y: 4, width: 6, height: 4 }, isVisible: true },
  { widgetType: 'TEAM_WORKLOAD', title: 'Team workload', position: { x: 6, y: 4, width: 6, height: 4 }, isVisible: true },
];

const WidgetLayoutEditor = () => {
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    dashboardService.getWidgets().then((items) => { if (items?.length) setWidgets(items); }).catch(() => setMessage('Widget preferences could not be loaded.'));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try { await dashboardService.saveWidgets(widgets); setMessage('Widget layout saved.'); }
    catch { setMessage('Widget layout could not be saved.'); }
    finally { setSaving(false); }
  };

  const moveWidget = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setWidgets((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((widget, index) => ({ ...widget, position: { ...widget.position, y: index } }));
    });
    setDraggedIndex(null);
  };

  return <section className="panel-block glass-card" aria-label="Widget layout">
    <div className="panel-header"><h3>Dashboard widgets</h3><button type="button" className="primary-button compact" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save layout'}</button></div>
    {widgets.map((widget, index) => <div className="task-row" key={widget.widgetType} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveWidget(index)}><span>{widget.title || widget.widgetType}</span><input aria-label={`Show ${widget.title || widget.widgetType}`} type="checkbox" checked={widget.isVisible !== false} onChange={(event) => setWidgets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, isVisible: event.target.checked } : item))} /></div>)}
    {message && <p className="helper-copy" role="status">{message}</p>}
  </section>;
};

export default WidgetLayoutEditor;