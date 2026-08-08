import { Link } from 'react-router-dom';
import { Layers, Clock, ShieldCheck } from 'lucide-react';

const ProjectCard = ({ project, onDelete, canUpdate = false, canDelete = false }) => {
  if (!project) return null;

  return (
    <article className="task-row project-card">
      <div className="project-card-main">
        <div className="task-pill-wrap project-card-badges">
          <span className="status-tag review">{project.status}</span>
          <span className="priority-tag medium">{project.priority}</span>
        </div>
        <strong className="project-card-title">{project.name}</strong>
        <p className="helper-copy project-card-description">{project.description || 'No description available.'}</p>
        <div className="task-meta project-card-meta">
          <span><Layers size={14} /> {project.key}</span>
          <span><Clock size={14} /> {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'No deadline'}</span>
          <span><ShieldCheck size={14} /> Manager: {project.projectManagerCustomId || project.projectManagerId || 'Unassigned'}</span>
        </div>
      </div>
      <div className="button-row project-card-actions">
        <Link to={`/projects/${project.id}`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Details</Link>
        {canUpdate ? <Link to={`/projects/${project.id}/edit`} className="secondary-button compact" style={{ textDecoration: 'none' }}>Edit</Link> : null}
        {canDelete ? <button type="button" className="ghost-button" onClick={() => onDelete(project.id)}>Delete</button> : null}
      </div>
    </article>
  );
};

export default ProjectCard;
