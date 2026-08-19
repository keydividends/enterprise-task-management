import { useEffect } from 'react';
import { XCircle } from 'lucide-react';

const ProjectToast = ({ toast, onDismiss }) => {
  const { id, message } = toast || {};

  useEffect(() => {
    if (!id) return undefined;
    const timer = window.setTimeout(() => onDismiss?.(id), 4000);
    return () => window.clearTimeout(timer);
  }, [id, onDismiss]);

  if (!message) return null;

  return (
    <div className="project-toast project-toast-error" role="alert" aria-live="assertive">
      <XCircle size={18} />
      <span>{message}</span>
      <button type="button" className="project-toast-dismiss" onClick={() => onDismiss?.(id)} aria-label="Dismiss notification">×</button>
    </div>
  );
};

export default ProjectToast;
