/**
 * Logger Utility
 * 
 * Provides structured logging with environment-aware output.
 * In production, only errors and warnings are logged.
 * Debug and info logs are suppressed unless in development mode.
 */

const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface LogLevel {
  DEBUG: boolean;
  INFO: boolean;
  WARN: boolean;
  ERROR: boolean;
}

const logLevels: LogLevel = {
  DEBUG: isDev && !isProduction,
  INFO: isDev,
  WARN: true,
  ERROR: true,
};

export const logger = {
  /**
   * Debug logs - only shown in development
   */
  debug: (...args: any[]) => {
    if (logLevels.DEBUG) {
      console.log('🔵', ...args);
    }
  },

  /**
   * Info logs - only shown in development
   */
  info: (...args: any[]) => {
    if (logLevels.INFO) {
      console.info('ℹ️', ...args);
    }
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args: any[]) => {
    if (logLevels.WARN) {
      console.warn('⚠️', ...args);
    }
  },

  /**
   * Error logs - always shown
   */
  error: (...args: any[]) => {
    if (logLevels.ERROR) {
      console.error('❌', ...args);
    }
  },

  /**
   * Success logs - only shown in development
   */
  success: (...args: any[]) => {
    if (logLevels.INFO) {
      console.log('✅', ...args);
    }
  },

  /**
   * Auth-specific debug logs - only shown in development with special prefix
   */
  auth: (...args: any[]) => {
    if (logLevels.DEBUG) {
      console.log('🔐', ...args);
    }
  },

  /**
   * Permission-specific debug logs - only shown in development
   */
  permission: (...args: any[]) => {
    if (logLevels.DEBUG) {
      console.log('🔒', ...args);
    }
  },
};

