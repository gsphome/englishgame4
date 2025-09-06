import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { type ToastData } from '../../stores/toastStore';

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  console.log('🧪 Toast component render for:', toast.id, toast);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  }, [onClose, toast.id]);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration || 4000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [toast.duration, handleClose]);

  // Handle programmatic close (faster animation)
  useEffect(() => {
    const handleProgrammaticClose = () => {
      setIsLeaving(true);
      setTimeout(() => {
        onClose(toast.id);
      }, 150); // Faster exit for programmatic closes
    };

    // Listen for programmatic close events
    const closeEvent = `close-toast-${toast.id}`;
    window.addEventListener(closeEvent, handleProgrammaticClose);

    return () => {
      window.removeEventListener(closeEvent, handleProgrammaticClose);
    };
  }, [toast.id, onClose]);

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5", 'aria-hidden': true };

    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle {...iconProps} className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'info':
        return <Info {...iconProps} className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Info {...iconProps} className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };



  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        pointerEvents: 'auto',
        transform: isLeaving ? 'translateX(100%)' : (isVisible ? 'translateX(0)' : 'translateX(100%)'),
        opacity: isLeaving ? 0 : (isVisible ? 1 : 0),
        transition: 'all 0.3s ease-out',
        backgroundColor: '#ffffff',
        minWidth: '320px',
        marginBottom: '8px',
        zIndex: 99999
      }}
    >
      <div
        className="toast__content"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px',
          gap: '12px'
        }}
      >
        <div
          className="toast__icon"
          style={{ flexShrink: 0, marginTop: '2px' }}
        >
          {getIcon()}
        </div>

        <div
          className="toast__text"
          style={{ flex: 1, minWidth: 0 }}
        >
          <div
            className="toast__title"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#111827',
              lineHeight: '1.25'
            }}
          >
            {toast.title}
          </div>
          {toast.message && (
            <div
              className="toast__message"
              style={{
                fontSize: '14px',
                color: '#4b5563',
                marginTop: '4px',
                lineHeight: '1.5'
              }}
            >
              {toast.message}
            </div>
          )}
        </div>

        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="toast__action"
            aria-label={toast.action.label}
          >
            {toast.action.label}
          </button>
        )}

        <button
          onClick={handleClose}
          className="toast__close"
          aria-label="Close notification"
          style={{
            flexShrink: 0,
            marginLeft: '8px',
            padding: '6px',
            borderRadius: '6px',
            color: '#9ca3af',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'colors 0.2s'
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;