import { AppError } from './AppError';

/**
 * Error thrown when network operations fail
 */
export class NetworkError extends AppError {
	public readonly url?: string;
	public readonly method?: string;
	public readonly statusCode: number;

	constructor(
		message: string,
		url?: string,
		method?: string,
		statusCode?: number,
		context?: Record<string, unknown>
	) {
		const actualStatusCode = statusCode ?? 0;
		super(message, 'NETWORK_ERROR', actualStatusCode, {
			url,
			method,
			statusCode: actualStatusCode,
			...context,
		});

		this.url = url;
		this.method = method;
		this.statusCode = actualStatusCode;
	}

	/**
	 * Create a network error for a failed request
	 */
	static requestFailed(
		url: string,
		method: string,
		statusCode: number,
		message?: string,
		context?: Record<string, unknown>
	): NetworkError {
		return new NetworkError(
			message ||
				`Request failed: ${method} ${url} returned ${statusCode}`,
			url,
			method,
			statusCode,
			context
		);
	}

	/**
	 * Create a network error for a timeout
	 */
	static timeout(
		url: string,
		method: string,
		timeoutMs: number,
		context?: Record<string, unknown>
	): NetworkError {
		return new NetworkError(
			`Request timeout: ${method} ${url} timed out after ${timeoutMs}ms`,
			url,
			method,
			408,
			context
		);
	}

	/**
	 * Create a network error for no internet connection
	 */
	static noConnection(
		url: string,
		method: string,
		context?: Record<string, unknown>
	): NetworkError {
		return new NetworkError(
			`No internet connection: ${method} ${url}`,
			url,
			method,
			0,
			context
		);
	}

	/**
	 * Check if this is a client error (4xx)
	 */
	isClientError(): boolean {
		return (
			this.statusCode !== undefined &&
			this.statusCode >= 400 &&
			this.statusCode < 500
		);
	}

	/**
	 * Check if this is a server error (5xx)
	 */
	isServerError(): boolean {
		return this.statusCode !== undefined && this.statusCode >= 500;
	}

	/**
	 * Check if this is a timeout error
	 */
	isTimeout(): boolean {
		return (
			this.statusCode === 408 ||
			this.message.toLowerCase().includes('timeout')
		);
	}
}
