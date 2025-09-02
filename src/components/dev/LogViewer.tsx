/**
 * Development-only log viewer component
 * Shows application logs for debugging purposes
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Filter } from 'lucide-react';
import { logger } from '../../utils/logger';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const currentLogs = logger.getLogs();
      setLogs(currentLogs);
    }
  }, [isOpen]);

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.component?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleDownload = () => {
    const logData = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🐛';
      default: return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Application Logs (Development)</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Download logs"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Clear logs"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 max-w-xs"
          />
          
          <div className="text-sm text-gray-500">
            {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs found matching the current filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${getLevelColor(log.level)} border-l-current`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getLevelIcon(log.level)}</span>
                      <span className="font-medium text-sm uppercase">
                        {log.level}
                      </span>
                      {log.component && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {log.component}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium mb-1">
                    {log.message}
                  </div>
                  
                  {log.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                        Show data
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
          <p>
            <strong>Note:</strong> This log viewer is only available in development mode. 
            Logs are stored in sessionStorage and cleared when the browser session ends.
          </p>
        </div>
      </div>
    </div>
  );
};