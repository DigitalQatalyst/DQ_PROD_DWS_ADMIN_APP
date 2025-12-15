/**
 * Test Setup Configuration
 * 
 * This file configures the test environment for RLS validation tests.
 */

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Only show console output for test results and important messages
global.console = {
  ...console,
  log: (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('✅') || message.includes('❌') || message.includes('📊') || message.includes('🧪')) {
      originalConsoleLog(...args);
    }
  },
  warn: (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('⚠️') || message.includes('Error')) {
      originalConsoleWarn(...args);
    }
  },
  error: originalConsoleError,
};

// Global test timeout
jest.setTimeout(30000);
