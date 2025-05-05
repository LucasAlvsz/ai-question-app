type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  constructor(private readonly context?: string) {}

  private format(level: LogLevel, message: string, data: unknown = null) {
    return {
      data,
      level,
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }

  info(message: string, data?: unknown) {
    console.info(JSON.stringify(this.format("info", message, data)));
  }

  error(message: string, data?: unknown) {
    console.error(JSON.stringify(this.format("error", message, data)));
  }
}
