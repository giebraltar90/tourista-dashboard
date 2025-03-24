
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  private logLevel: LogLevel = 'info';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Sets the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Debug level logging - only shown in development by default
   */
  debug(message: string, ...optionalParams: any[]): void {
    if (this.isProduction && this.logLevel !== 'debug') return;
    console.debug(`📋 ${message}`, ...optionalParams);
  }

  /**
   * Info level logging
   */
  info(message: string, ...optionalParams: any[]): void {
    if (this.logLevel === 'warn' || this.logLevel === 'error') return;
    console.info(`ℹ️ ${message}`, ...optionalParams);
  }

  /**
   * Warning level logging
   */
  warn(message: string, ...optionalParams: any[]): void {
    if (this.logLevel === 'error') return;
    console.warn(`⚠️ ${message}`, ...optionalParams);
  }

  /**
   * Error level logging
   */
  error(message: string, ...optionalParams: any[]): void {
    console.error(`❌ ${message}`, ...optionalParams);
  }
}

export const logger = new LoggerService();
