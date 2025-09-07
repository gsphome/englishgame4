import React, { useEffect, useState, useCallback } from 'react';
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

  const getIcon = () => {
    const iconProps = { className: "toast-card__icon-svg", 'aria-hidden': true };

    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // BEM classes
  const baseClass = 'toast-card';
  const modifierClass = `${baseClass}--${toast.type}`;
  const stateClass = isLeaving 
    ? `${baseClass}--exiting` 
    : isVisible 
      ? `${baseClass}--visible` 
      : `${baseClass}--entering`;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`${baseClass} ${modifierClass} ${stateClass}`}
      style={{
        // Inline styles for immediate functionality (will be moved to CSS in task 7)
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        pointerEvents: 'auto',
        transform: isLeaving ? 'translateX(100%)' : (isVisible ? 'translateX(0)' : 'translateX(100%)'),
        opacity: isLeaving ? 0 : (isVisible ? 1 : 0),
        transition: 'all 0.3s ease-out',
        backgroundColor: '#ffffff',
        width: 'calc(100vw - 32px)',
        maxWidth: '320px',
        minHeight: '44px',
        margin: '0 16px 8px 16px',
        zIndex: 99999
      }}
    >
      <div className={`${baseClass}__container`}>
        <div
          className={`${baseClass}__content`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '12px',
            gap: '8px'
          }}
        >
          <div
            className={`${baseClass}__icon`}
            style={{ 
              flexShrink: 0, 
              marginTop: '2px',
              width: '16px',
              height: '16px'
            }}
          >
            {getIcon()}
          </div>

          <div
            className={`${baseClass}__text`}
            style={{ flex: 1, minWidth: 0 }}
          >
            <div
              className={`${baseClass}__title`}
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.2'
              }}
            >
              {toast.title}
            </div>
            {toast.message && (
              <div
                className={`${baseClass}__message`}
                style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  marginTop: '2px',
                  lineHeight: '1.3'
                }}
              >
                {toast.message}
              </div>
            )}
          </div>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`${baseClass}__action`}
              aria-label={toast.action.label}
              style={{
                flexShrink: 0,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                minHeight: '32px'
              }}
            >
              {toast.action.label}
            </button>
          )}

          <button
            onClick={handleClose}
            className={`${baseClass}__close`}
            aria-label="Close notification"
            style={{
              flexShrink: 0,
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
    </div>
  );
};

export default Toast;