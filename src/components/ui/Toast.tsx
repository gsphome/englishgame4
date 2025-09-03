import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { type ToastData } from '../../stores/toastStore';

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

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

  const getToastClasses = () => {
    const baseClasses = `
      toast toast--${toast.type}
      ${isVisible ? 'toast--visible' : ''}
      ${isLeaving ? 'toast--leaving' : ''}
    `;

    return baseClasses.trim();
  };

  return (
    <div
      className={getToastClasses()}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast__content">
        <div className="toast__icon">
          {getIcon()}
        </div>
        
        <div className="toast__text">
          <div className="toast__title">
            {toast.title}
          </div>
          {toast.message && (
            <div className="toast__message">
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
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;