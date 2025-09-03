import React from 'react';
import Toast from './Toast';
import { useToastStore, type ToastData } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="toast-container"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast: ToastData) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};