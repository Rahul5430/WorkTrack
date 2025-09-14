export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	[key: string]: unknown;
}

export interface Logger {
	debug(message: string, context?: LogContext): void;
	info(message: string, context?: LogContext): void;
	warn(message: string, context?: LogContext): void;
	error(message: string, context?: LogContext): void;
}

export class ConsoleLogger implements Logger {
	debug(message: string, context?: LogContext): void {
		// eslint-disable-next-line no-console
		console.debug(`[DEBUG] ${message}`, context ?? '');
	}
	info(message: string, context?: LogContext): void {
		// eslint-disable-next-line no-console
		console.info(`[INFO] ${message}`, context ?? '');
	}
	warn(message: string, context?: LogContext): void {
		// eslint-disable-next-line no-console
		console.warn(`[WARN] ${message}`, context ?? '');
	}
	error(message: string, context?: LogContext): void {
		// eslint-disable-next-line no-console
		console.error(`[ERROR] ${message}`, context ?? '');
	}
}

export class NoopLogger implements Logger {
	debug(): void {}
	info(): void {}
	warn(): void {}
	error(): void {}
}

export const logger: Logger = new ConsoleLogger();
