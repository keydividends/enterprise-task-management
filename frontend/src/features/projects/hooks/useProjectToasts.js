import { useCallback, useState } from 'react';

let toastCounter = 0;

const useProjectToasts = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const error = useCallback((message) => {
    if (!message) return;
    const id = `project-toast-${Date.now()}-${toastCounter++}`;
    setToasts((current) => [...current, { id, message }]);
  }, []);

  return { toasts, dismiss, error };
};

export default useProjectToasts;
