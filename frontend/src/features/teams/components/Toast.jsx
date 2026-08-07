import { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

const TOAST_TYPES = {
  success: { icon: CheckCircle2, className: 'toast-success' },
  error: { icon: XCircle, className: 'toast-error' },
  info: { icon: Info, className: 'toast-info' },
};

const Toast = ({ toast, onDismiss }) => {
  const { id, type = 'info', message } = toast || {};
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => onDismiss?.(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast ${config.className}`} role="status" aria-live="polite">
      <Icon size={16} />
      <span>{message}</span>
      <button type="button" className="toast-dismiss" onClick={() => onDismiss?.(id)} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
};

export default Toast;
