import { NetworkError } from '../../../../../src/shared/domain/errors/NetworkError';

describe('NetworkError', () => {
	describe('constructor', () => {
		it('should create network error with basic properties', () => {
			const error = new NetworkError(
				'Request failed',
				'https://api.example.com',
				'GET',
				404
			);

			expect(error.message).toBe('Request failed');
			expect(error.code).toBe('NETWORK_ERROR');
			expect(error.url).toBe('https://api.example.com');
			expect(error.method).toBe('GET');
			expect(error.statusCode).toBe(404);
		});

		it('should create network error without optional properties', () => {
			const error = new NetworkError('Network issue');

			expect(error.message).toBe('Network issue');
			expect(error.url).toBeUndefined();
			expect(error.method).toBeUndefined();
			expect(error.statusCode).toBe(0);
		});

		it('should include network properties in context', () => {
			const error = new NetworkError(
				'Request failed',
				'https://api.example.com',
				'POST',
				500
			);

			expect(error.context?.url).toBe('https://api.example.com');
			expect(error.context?.method).toBe('POST');
			expect(error.context?.statusCode).toBe(500);
		});
	});

	describe('static methods', () => {
		describe('requestFailed', () => {
			it('should create request failed error', () => {
				const error = NetworkError.requestFailed(
					'https://api.example.com',
					'GET',
					404
				);

				expect(error.message).toBe(
					'Request failed: GET https://api.example.com returned 404'
				);
				expect(error.url).toBe('https://api.example.com');
				expect(error.method).toBe('GET');
				expect(error.statusCode).toBe(404);
			});

			it('should use custom message', () => {
				const error = NetworkError.requestFailed(
					'https://api.example.com',
					'POST',
					500,
					'Server error occurred'
				);

				expect(error.message).toBe('Server error occurred');
			});
		});

		describe('timeout', () => {
			it('should create timeout error', () => {
				const error = NetworkError.timeout(
					'https://api.example.com',
					'GET',
					5000
				);

				expect(error.message).toBe(
					'Request timeout: GET https://api.example.com timed out after 5000ms'
				);
				expect(error.url).toBe('https://api.example.com');
				expect(error.method).toBe('GET');
				expect(error.statusCode).toBe(408);
			});
		});

		describe('noConnection', () => {
			it('should create no connection error', () => {
				const error = NetworkError.noConnection(
					'https://api.example.com',
					'GET'
				);

				expect(error.message).toBe(
					'No internet connection: GET https://api.example.com'
				);
				expect(error.url).toBe('https://api.example.com');
				expect(error.method).toBe('GET');
				expect(error.statusCode).toBe(0);
			});
		});
	});

	describe('type checking methods', () => {
		it('should identify client errors', () => {
			const clientError = new NetworkError(
				'Bad request',
				'https://api.example.com',
				'GET',
				400
			);
			const serverError = new NetworkError(
				'Server error',
				'https://api.example.com',
				'GET',
				500
			);
			const noStatusCode = new NetworkError('Network issue');

			expect(clientError.isClientError()).toBe(true);
			expect(serverError.isClientError()).toBe(false);
			expect(noStatusCode.isClientError()).toBe(false);
		});

		it('should identify server errors', () => {
			const clientError = new NetworkError(
				'Bad request',
				'https://api.example.com',
				'GET',
				400
			);
			const serverError = new NetworkError(
				'Server error',
				'https://api.example.com',
				'GET',
				500
			);
			const noStatusCode = new NetworkError('Network issue');

			expect(clientError.isServerError()).toBe(false);
			expect(serverError.isServerError()).toBe(true);
			expect(noStatusCode.isServerError()).toBe(false);
		});

		it('should identify timeout errors', () => {
			const timeoutError = new NetworkError(
				'Request timeout',
				'https://api.example.com',
				'GET',
				408
			);
			const regularError = new NetworkError(
				'Request failed',
				'https://api.example.com',
				'GET',
				404
			);
			const timeoutMessageError = new NetworkError(
				'Request timeout after 5000ms'
			);

			expect(timeoutError.isTimeout()).toBe(true);
			expect(regularError.isTimeout()).toBe(false);
			expect(timeoutMessageError.isTimeout()).toBe(true);
		});
	});
});
