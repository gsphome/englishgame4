import React from 'react';
import Toast from './Toast';
import { useToastStore } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const { currentToast, isVisible, clearToast } = useToastStore();

  // Only render if there's a toast and it's visible
  if (!currentToast || !isVisible) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      role="region"
      className="toast-container"
      style={{
        position: 'fixed',
        zIndex: 99999,
        pointerEvents: 'none',
        top: '16px',
        // Responsive positioning
        ...(window.innerWidth >= 640 ? {
          // Desktop/Tablet - top right
          right: '16px',
          left: 'auto',
        } : {
          // Mobile - centered top
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
        })
      }}
    >
      <Toast
        key={currentToast.id}
        toast={currentToast}
        onClose={clearToast}
      />
    </div>
  );
};