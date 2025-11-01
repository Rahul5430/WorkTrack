/* eslint-disable no-console */
// migrated to V2 structure

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

export interface LoggerConfig {
	level: LogLevel;
	enableConsole: boolean;
	enableRemote: boolean;
}

export class Logger {
	private config: LoggerConfig;

	constructor(config: Partial<LoggerConfig> = {}) {
		this.config = {
			level: LogLevel.INFO,
			enableConsole: true,
			enableRemote: false,
			...config,
		};
	}

	debug(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			this.log('DEBUG', message, ...args);
		}
	}

	info(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.INFO)) {
			this.log('INFO', message, ...args);
		}
	}

	warn(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.WARN)) {
			this.log('WARN', message, ...args);
		}
	}

	error(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			this.log('ERROR', message, ...args);
		}
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.config.level;
	}

	private log(level: string, message: string, ...args: unknown[]): void {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] ${level}: ${message}`;

		if (this.config.enableConsole) {
			switch (level) {
				case 'DEBUG':
					console.debug(logMessage, ...args);
					break;
				case 'INFO':
					console.info(logMessage, ...args);
					break;
				case 'WARN':
					console.warn(logMessage, ...args);
					break;
				case 'ERROR':
					console.error(logMessage, ...args);
					break;
			}
		}

		// Remote logging intentionally disabled by default; plug in service when needed
		if (this.config.enableRemote) {
			// Remote logging implementation
		}
	}

	setConfig(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	getConfig(): LoggerConfig {
		return { ...this.config };
	}
}

// Default logger instance
export const logger = new Logger({
	level:
		process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
	enableConsole: true,
	enableRemote: false,
});
