
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

  formatArgs(args: any[]): any[] {
    if (args.length === 0) return args;
    
    // Extract the first argument if it's a string
    if (typeof args[0] === 'string') {
      const firstArg = args[0];
      const restArgs = args.slice(1);
      
      // If we already have a prefix, don't add timestamp
      if (firstArg.startsWith('🎟️') || 
          firstArg.startsWith('🔍') || 
          firstArg.startsWith('✅') || 
          firstArg.startsWith('❌') ||
          firstArg.startsWith('❓')) {
        return [firstArg, ...restArgs];
      }
      
      // Add timestamp to first arg if it's a string
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      return [`[${timestamp}] ${firstArg}`, ...restArgs];
    }
    
    return args;
  }

  log(...args: any[]) {
    // Always show logs
    this.originalConsole.log(...this.formatArgs(args));
  }

  info(...args: any[]) {
    // Always show info messages
    this.originalConsole.info(...this.formatArgs(args));
  }

  warn(...args: any[]) {
    // Always show warnings
    this.originalConsole.warn(...this.formatArgs(args));
  }

  error(...args: any[]) {
    // Always show errors
    this.originalConsole.error(...this.formatArgs(args));
  }

  debug(...args: any[]) {
    // Force debug logs for troubleshooting
    this.originalConsole.debug(...this.formatArgs(args));
  }
}

export const logger = new Logger();

// Hook to use in React components
export const useLogger = () => {
  const debugMode = useDebugMode();
  logger.setDebugMode(debugMode);
  return logger;
};
