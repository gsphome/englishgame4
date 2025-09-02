/**
 * Secure logging utility that filters sensitive information
 * and disables logging in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class SecureLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];

  /**
   * Filter sensitive data from objects
   * @param data - Data to filter
   * @returns Filtered data
   */
  private filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item));
    }

    const filtered: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveKeys.some(sensitiveKey => 
        lowerKey.includes(sensitiveKey)
      );

      if (isSensitive) {
        filtered[key] = '[FILTERED]';
      } else if (typeof value === 'object') {
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Create log entry
   * @param level - Log level
   * @param message - Log message
   * @param data - Additional data
   * @param component - Component name
   * @returns Log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      level,
      message,
      data: data ? this.filterSensitiveData(data) : undefined,
      timestamp: new Date().toISOString(),
      component
    };
  }

  /**
   * Log debug message (development only)
   * @param message - Debug message
   * @param data - Additional data
   * @param component - Component name
   */
  debug(message: string, data?: any, component?: string): void {
    if (this.isProduction) return;

    const entry = this.createLogEntry('debug', message, data, component);
    console.debug(`🐛 [${entry.timestamp}] ${component ? `[${component}] ` : ''}${message}`, entry.data || '');
  }

  /**
   * Log info message
   * @param message - Info message
   * @param data - Additional data
   * @param component - Component name
   */
  info(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('info', message, data, component);
    
    if (this.isProduction) {
      // In production, only log to a monitoring service (not console)
      this.sendToMonitoring(entry);
    } else {
      console.info(`ℹ️ [${entry.timestamp}] ${component ? `[${component}] ` : ''}${message}`, entry.data || '');
    }
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param data - Additional data
   * @param component - Component name
   */
  warn(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('warn', message, data, component);
    
    if (this.isProduction) {
      this.sendToMonitoring(entry);
    } else {
      console.warn(`⚠️ [${entry.timestamp}] ${component ? `[${component}] ` : ''}${message}`, entry.data || '');
    }
  }

  /**
   * Log error message
   * @param message - Error message
   * @param data - Additional data
   * @param component - Component name
   */
  error(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('error', message, data, component);
    
    if (this.isProduction) {
      this.sendToMonitoring(entry);
      // Still log errors to console in production for debugging
      console.error(`❌ ${message}`);
    } else {
      console.error(`❌ [${entry.timestamp}] ${component ? `[${component}] ` : ''}${message}`, entry.data || '');
    }
  }

  /**
   * Send log entry to monitoring service (placeholder)
   * @param entry - Log entry to send
   */
  private sendToMonitoring(entry: LogEntry): void {
    // In a real application, this would send logs to a monitoring service
    // like Sentry, LogRocket, or a custom logging endpoint
    
    // For now, we'll store in sessionStorage for development purposes
    try {
      const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silently fail if sessionStorage is not available
    }
  }

  /**
   * Get stored logs (development only)
   * @returns Array of log entries
   */
  getLogs(): LogEntry[] {
    if (this.isProduction) return [];
    
    try {
      return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    try {
      sessionStorage.removeItem('app_logs');
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Convenience functions
export const logDebug = (message: string, data?: any, component?: string) => 
  logger.debug(message, data, component);

export const logInfo = (message: string, data?: any, component?: string) => 
  logger.info(message, data, component);

export const logWarn = (message: string, data?: any, component?: string) => 
  logger.warn(message, data, component);

export const logError = (message: string, data?: any, component?: string) => 
  logger.error(message, data, component);