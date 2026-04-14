interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  provider?: string;
  duration?: number;
  statusCode?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private log(level: LogEntry['level'], message: string, metadata?: Partial<LogEntry>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata,
    };

    const logString = JSON.stringify(entry);

    if (level === 'error') {
      console.error(logString);
    } else if (level === 'warn') {
      console.warn(logString);
    } else {
      console.log(logString);
    }
  }

  info(message: string, metadata?: Partial<LogEntry>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Partial<LogEntry>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Partial<LogEntry>) {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: Partial<LogEntry>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, metadata);
    }
  }

  requestStart(provider: string, operation: string, metadata?: Record<string, unknown>) {
    this.info(`${provider} ${operation} started`, {
      provider,
      metadata,
    });
    return Date.now();
  }

  requestEnd(startTime: number, provider: string, operation: string, statusCode?: number, metadata?: Record<string, unknown>) {
    const duration = Date.now() - startTime;
    this.info(`${provider} ${operation} completed`, {
      provider,
      duration,
      statusCode,
      metadata,
    });
  }

  requestError(startTime: number, provider: string, operation: string, error: Error, metadata?: Record<string, unknown>) {
    const duration = Date.now() - startTime;
    this.error(`${provider} ${operation} failed`, {
      provider,
      duration,
      error: error.message,
      metadata,
    });
  }
}

export const logger = new Logger();
