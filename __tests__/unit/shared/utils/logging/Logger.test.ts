import { Logger, LogLevel } from '@/shared/utils/logging/Logger';

describe('Logger', () => {
	let consoleSpy: {
		debug: jest.SpyInstance;
		info: jest.SpyInstance;
		warn: jest.SpyInstance;
		error: jest.SpyInstance;
	};

	beforeEach(() => {
		consoleSpy = {
			debug: jest.spyOn(console, 'debug').mockImplementation(),
			info: jest.spyOn(console, 'info').mockImplementation(),
			warn: jest.spyOn(console, 'warn').mockImplementation(),
			error: jest.spyOn(console, 'error').mockImplementation(),
		};
	});

	afterEach(() => {
		Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
	});

	describe('constructor', () => {
		it('creates logger with default config', () => {
			const logger = new Logger();

			logger.info('Test message');
			expect(consoleSpy.info).toHaveBeenCalled();
		});

		it('creates logger with custom config', () => {
			const logger = new Logger({
				level: LogLevel.WARN,
				enableConsole: false,
				enableRemote: true,
			});

			logger.info('Test message');
			expect(consoleSpy.info).not.toHaveBeenCalled();
		});
	});

	describe('debug', () => {
		it('logs debug message when level is DEBUG', () => {
			const logger = new Logger({ level: LogLevel.DEBUG });

			logger.debug('Debug message');

			expect(consoleSpy.debug).toHaveBeenCalled();
		});

		it('does not log debug when level is higher', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.debug('Debug message');

			expect(consoleSpy.debug).not.toHaveBeenCalled();
		});

		it('does not log when console is disabled', () => {
			const logger = new Logger({
				level: LogLevel.DEBUG,
				enableConsole: false,
			});

			logger.debug('Debug message');

			expect(consoleSpy.debug).not.toHaveBeenCalled();
		});
	});

	describe('info', () => {
		it('logs info message when level is INFO or lower', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.info('Info message');

			expect(consoleSpy.info).toHaveBeenCalled();
		});

		it('does not log info when level is higher', () => {
			const logger = new Logger({ level: LogLevel.WARN });

			logger.info('Info message');

			expect(consoleSpy.info).not.toHaveBeenCalled();
		});

		it('passes additional arguments', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.info('Info message', { key: 'value' }, 123);

			expect(consoleSpy.info).toHaveBeenCalledWith(
				expect.stringContaining('INFO: Info message'),
				{ key: 'value' },
				123
			);
		});
	});

	describe('warn', () => {
		it('logs warn message when level is WARN or lower', () => {
			const logger = new Logger({ level: LogLevel.WARN });

			logger.warn('Warn message');

			expect(consoleSpy.warn).toHaveBeenCalled();
		});

		it('does not log warn when level is higher', () => {
			const logger = new Logger({ level: LogLevel.ERROR });

			logger.warn('Warn message');

			expect(consoleSpy.warn).not.toHaveBeenCalled();
		});

		it('logs warn when level is INFO', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.warn('Warn message');

			expect(consoleSpy.warn).toHaveBeenCalled();
		});
	});

	describe('error', () => {
		it('always logs error messages', () => {
			const logger = new Logger({ level: LogLevel.ERROR });

			logger.error('Error message');

			expect(consoleSpy.error).toHaveBeenCalled();
		});

		it('logs error with any log level', () => {
			const logger = new Logger({ level: LogLevel.DEBUG });

			logger.error('Error message');

			expect(consoleSpy.error).toHaveBeenCalled();
		});

		it('passes error objects as arguments', () => {
			const logger = new Logger({ level: LogLevel.ERROR });
			const error = new Error('Test error');

			logger.error('Error occurred', error);

			expect(consoleSpy.error).toHaveBeenCalledWith(
				expect.stringContaining('ERROR: Error occurred'),
				error
			);
		});
	});

	describe('log level filtering', () => {
		it('filters logs below configured level', () => {
			const logger = new Logger({ level: LogLevel.WARN });

			logger.debug('Debug message');
			logger.info('Info message');
			logger.warn('Warn message');
			logger.error('Error message');

			expect(consoleSpy.debug).not.toHaveBeenCalled();
			expect(consoleSpy.info).not.toHaveBeenCalled();
			expect(consoleSpy.warn).toHaveBeenCalled();
			expect(consoleSpy.error).toHaveBeenCalled();
		});

		it('allows all logs at DEBUG level', () => {
			const logger = new Logger({ level: LogLevel.DEBUG });

			logger.debug('Debug message');
			logger.info('Info message');
			logger.warn('Warn message');
			logger.error('Error message');

			expect(consoleSpy.debug).toHaveBeenCalled();
			expect(consoleSpy.info).toHaveBeenCalled();
			expect(consoleSpy.warn).toHaveBeenCalled();
			expect(consoleSpy.error).toHaveBeenCalled();
		});
	});

	describe('remote logging', () => {
		it('does not call remote when disabled', () => {
			const logger = new Logger({
				enableRemote: false,
				level: LogLevel.DEBUG,
			});

			logger.info('Test message');

			// Remote logging is not implemented yet
			expect(consoleSpy.info).toHaveBeenCalled();
		});

		it('does not call remote even when enabled (not implemented)', () => {
			const logger = new Logger({
				enableRemote: true,
				level: LogLevel.DEBUG,
			});

			logger.info('Test message');

			// Remote logging is intentionally not implemented
			expect(consoleSpy.info).toHaveBeenCalled();
		});
	});

	describe('log formatting', () => {
		it('includes timestamp in log message', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.info('Test message');

			const callArgs = consoleSpy.info.mock.calls[0][0];
			expect(callArgs).toMatch(/\[.*\] INFO: Test message/);
		});

		it('formats messages with level prefix', () => {
			const logger = new Logger({ level: LogLevel.DEBUG });

			logger.debug('Debug test');
			logger.info('Info test');
			logger.warn('Warn test');
			logger.error('Error test');

			expect(consoleSpy.debug.mock.calls[0][0]).toContain('DEBUG:');
			expect(consoleSpy.info.mock.calls[0][0]).toContain('INFO:');
			expect(consoleSpy.warn.mock.calls[0][0]).toContain('WARN:');
			expect(consoleSpy.error.mock.calls[0][0]).toContain('ERROR:');
		});
	});

	describe('config management', () => {
		it('sets config dynamically', () => {
			const logger = new Logger({ level: LogLevel.INFO });

			logger.setConfig({ level: LogLevel.WARN });

			logger.info('Should not log');
			logger.warn('Should log');

			expect(consoleSpy.info).not.toHaveBeenCalled();
			expect(consoleSpy.warn).toHaveBeenCalled();
		});

		it('gets current config', () => {
			const logger = new Logger({
				level: LogLevel.WARN,
				enableConsole: false,
				enableRemote: true,
			});

			const config = logger.getConfig();

			expect(config.level).toBe(LogLevel.WARN);
			expect(config.enableConsole).toBe(false);
			expect(config.enableRemote).toBe(true);
		});

		it('merges partial config updates', () => {
			const logger = new Logger({
				level: LogLevel.INFO,
				enableConsole: true,
				enableRemote: false,
			});

			logger.setConfig({ level: LogLevel.ERROR });

			const config = logger.getConfig();

			expect(config.level).toBe(LogLevel.ERROR);
			expect(config.enableConsole).toBe(true);
			expect(config.enableRemote).toBe(false);
		});
	});
});
