import { Link } from 'react-router-dom';
import { Layers, Clock, ShieldCheck } from 'lucide-react';

const ProjectCard = ({ project, onDelete }) => {
  if (!project) return null;

  return (
    <div className="task-row" style={{ alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="task-pill-wrap" style={{ marginBottom: '8px' }}>
          <span className="status-tag review">{project.status}</span>
          <span className="priority-tag medium">{project.priority}</span>
        </div>
        <strong>{project.name}</strong>
        <p className="helper-copy" style={{ margin: '8px 0 0 0' }}>{project.description || 'No description available.'}</p>
        <div className="task-meta" style={{ marginTop: '10px' }}>
          <span><Layers size={14} /> {project.key}</span>
          <span><Clock size={14} /> {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'No deadline'}</span>
          <span><ShieldCheck size={14} /> Manager: {project.projectManagerCustomId || project.projectManagerId || 'Unassigned'}</span>
        </div>
      </div>
      <div className="button-row" style={{ flexDirection: 'column', gap: '8px' }}>
        <Link to={`/projects/${project.id}`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Details</Link>
        <Link to={`/projects/${project.id}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit</Link>
        <button type="button" className="ghost-button" onClick={() => onDelete(project.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
