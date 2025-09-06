import React from 'react';
import Toast from './Toast';
import { useToastStore, type ToastData } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  console.log('🧪 ToastContainer render, toasts:', toasts);

  if (toasts.length === 0) {
    console.log('🧪 ToastContainer: No toasts, returning null');
    return null;
  }

  console.log('🧪 ToastContainer: Rendering', toasts.length, 'toasts');

  return (
    <div
      aria-label="Notifications"
      role="region"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '420px'
      }}
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