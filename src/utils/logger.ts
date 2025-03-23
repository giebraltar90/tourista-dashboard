
import { useDebugMode } from '@/contexts/DebugContext';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

// Standard emoji prefixes for different log types 
const LOG_PREFIXES = {
  participant: "👤",
  group: "👥",
  guide: "🧭",
  ticket: "🎟️",
  db: "💾",
  api: "🔌",
  sync: "🔄",
  move: "↔️",
  error: "❌",
  success: "✅",
};

class Logger {
  // Store original console methods
  private originalConsole: Record<LogLevel, (...args: any[]) => void>;
  private debugEnabled: boolean = false;
  private forceDebug: boolean = true; // Force debug logs on for troubleshooting

  constructor() {
    // Save original console methods
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
  }

  setDebugMode(enabled: boolean) {
    this.debugEnabled = enabled || this.forceDebug;
  }

  log(...args: any[]) {
    if (this.debugEnabled) {
      this.originalConsole.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.debugEnabled) {
      this.originalConsole.info(...args);
    }
  }

  warn(...args: any[]) {
    // Always show warnings
    this.originalConsole.warn(...args);
  }

  error(...args: any[]) {
    // Always show errors
    this.originalConsole.error(...args);
  }

  debug(...args: any[]) {
    // Force debug logs for troubleshooting
    this.originalConsole.debug(...args);
  }
}

export const logger = new Logger();

// Hook to use in React components
export const useLogger = () => {
  const debugMode = useDebugMode();
  logger.setDebugMode(debugMode);
  return logger;
};
