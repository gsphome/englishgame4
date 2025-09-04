import React from 'react';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { ToastContainer } from './ToastContainer';

// Memoized Header component
export const MemoizedHeader = React.memo(Header, (prevProps, nextProps) => {
  return (
    prevProps.onMenuToggle === nextProps.onMenuToggle &&
    prevProps.onDashboardToggle === nextProps.onDashboardToggle
  );
});

MemoizedHeader.displayName = 'MemoizedHeader';

// Memoized Dashboard component
export const MemoizedDashboard = React.memo(Dashboard, (prevProps, nextProps) => {
  return prevProps.onClose === nextProps.onClose;
});

MemoizedDashboard.displayName = 'MemoizedDashboard';

// Memoized ToastContainer component
export const MemoizedToastContainer = React.memo(ToastContainer);

MemoizedToastContainer.displayName = 'MemoizedToastContainer';