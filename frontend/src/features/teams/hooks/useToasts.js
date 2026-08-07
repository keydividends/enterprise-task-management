import { useCallback, useState } from 'react';

let toastCounter = 0;

const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, type = 'info') => {
    if (!message) return;
    const id = `toast-${Date.now()}-${toastCounter++}`;
    setToasts((current) => [...current, { id, message, type }]);
  }, []);

  const success = useCallback((message) => push(message, 'success'), [push]);
  const error = useCallback((message) => push(message, 'error'), [push]);
  const info = useCallback((message) => push(message, 'info'), [push]);

  return { toasts, dismiss, success, error, info };
};

export default useToasts;
