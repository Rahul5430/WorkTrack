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
	throttleMs?: number;
}

interface ThrottleEntry {
	lastLogged: number;
	count: number;
}

export class Logger {
	private config: LoggerConfig;
	private throttleMap = new Map<string, ThrottleEntry>();
	private readonly DEFAULT_THROTTLE_MS = 5000;

	constructor(config: Partial<LoggerConfig> = {}) {
		const envLevel =
			process.env.LOG_LEVEL === 'debug'
				? LogLevel.DEBUG
				: process.env.LOG_LEVEL === 'warn'
					? LogLevel.WARN
					: process.env.LOG_LEVEL === 'error'
						? LogLevel.ERROR
						: LogLevel.INFO;

		this.config = {
			level:
				process.env.NODE_ENV === 'development'
					? envLevel
					: LogLevel.WARN,
			enableConsole: true,
			enableRemote: false,
			throttleMs: this.DEFAULT_THROTTLE_MS,
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

	private shouldThrottle(message: string): boolean {
		if (!this.config.throttleMs || this.config.throttleMs <= 0) {
			return false;
		}

		const now = Date.now();
		const entry = this.throttleMap.get(message);

		if (!entry) {
			this.throttleMap.set(message, { lastLogged: now, count: 1 });
			return false;
		}

		const timeSinceLastLog = now - entry.lastLogged;
		if (timeSinceLastLog >= this.config.throttleMs) {
			// Reset throttle window
			this.throttleMap.set(message, { lastLogged: now, count: 1 });
			return false;
		}

		// Within throttle window, increment count
		entry.count++;
		return true;
	}

	private log(level: string, message: string, ...args: unknown[]): void {
		// Throttle INFO and DEBUG logs to reduce noise
		if (
			(level === 'INFO' || level === 'DEBUG') &&
			this.shouldThrottle(message)
		) {
			return;
		}

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
// In development, default to WARN to reduce noise unless LOG_LEVEL is explicitly set
// In production, default to WARN
export const logger = new Logger({
	level:
		process.env.NODE_ENV === 'development'
			? process.env.LOG_LEVEL === 'debug'
				? LogLevel.DEBUG
				: process.env.LOG_LEVEL === 'info'
					? LogLevel.INFO
					: LogLevel.WARN
			: LogLevel.WARN,
	enableConsole: true,
	enableRemote: false,
	throttleMs: 5000,
});
