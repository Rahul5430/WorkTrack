import { SyncError } from '../../../../../src/shared/domain/errors/SyncError';

describe('SyncError', () => {
	describe('constructor', () => {
		it('should create sync error with basic properties', () => {
			const error = new SyncError(
				'Sync failed',
				'UPLOAD',
				'WorkEntry',
				'entry-123'
			);

			expect(error.message).toBe('Sync failed');
			expect(error.code).toBe('SYNC_ERROR');
			expect(error.statusCode).toBe(500);
			expect(error.operation).toBe('UPLOAD');
			expect(error.entityType).toBe('WorkEntry');
			expect(error.entityId).toBe('entry-123');
			expect(error.retryable).toBe(true);
		});

		it('should create sync error with retryable false', () => {
			const error = new SyncError(
				'Sync failed',
				'UPLOAD',
				'WorkEntry',
				'entry-123',
				false
			);

			expect(error.retryable).toBe(false);
		});

		it('should include sync properties in context', () => {
			const error = new SyncError(
				'Sync failed',
				'UPLOAD',
				'WorkEntry',
				'entry-123'
			);

			expect(error.context?.operation).toBe('UPLOAD');
			expect(error.context?.entityType).toBe('WorkEntry');
			expect(error.context?.entityId).toBe('entry-123');
			expect(error.context?.retryable).toBe(true);
		});
	});

	describe('static methods', () => {
		describe('uploadFailed', () => {
			it('should create upload failed error', () => {
				const error = SyncError.uploadFailed(
					'WorkEntry',
					'entry-123',
					'Network timeout'
				);

				expect(error.message).toBe(
					'Failed to upload WorkEntry entry-123: Network timeout'
				);
				expect(error.operation).toBe('UPLOAD');
				expect(error.entityType).toBe('WorkEntry');
				expect(error.entityId).toBe('entry-123');
				expect(error.retryable).toBe(true);
			});
		});

		describe('downloadFailed', () => {
			it('should create download failed error', () => {
				const error = SyncError.downloadFailed(
					'WorkEntry',
					'entry-123',
					'Server error'
				);

				expect(error.message).toBe(
					'Failed to download WorkEntry entry-123: Server error'
				);
				expect(error.operation).toBe('DOWNLOAD');
				expect(error.entityType).toBe('WorkEntry');
				expect(error.entityId).toBe('entry-123');
				expect(error.retryable).toBe(true);
			});
		});

		describe('conflict', () => {
			it('should create conflict error', () => {
				const error = SyncError.conflict(
					'WorkEntry',
					'entry-123',
					1,
					2
				);

				expect(error.message).toBe(
					'Sync conflict for WorkEntry entry-123: local version 1 conflicts with remote version 2'
				);
				expect(error.operation).toBe('CONFLICT');
				expect(error.entityType).toBe('WorkEntry');
				expect(error.entityId).toBe('entry-123');
				expect(error.retryable).toBe(false);
				expect(error.context?.localVersion).toBe(1);
				expect(error.context?.remoteVersion).toBe(2);
			});
		});

		describe('networkIssue', () => {
			it('should create network issue error', () => {
				const error = SyncError.networkIssue(
					'UPLOAD',
					'Connection lost'
				);

				expect(error.message).toBe(
					'Network issue during UPLOAD: Connection lost'
				);
				expect(error.operation).toBe('UPLOAD');
				expect(error.retryable).toBe(true);
			});
		});

		describe('serverError', () => {
			it('should create server error', () => {
				const error = SyncError.serverError(
					'UPLOAD',
					500,
					'Internal server error'
				);

				expect(error.message).toBe(
					'Server error during UPLOAD: 500 - Internal server error'
				);
				expect(error.operation).toBe('UPLOAD');
				expect(error.retryable).toBe(true);
				expect(error.context?.statusCode).toBe(500);
			});
		});

		describe('validationFailed', () => {
			it('should create validation failed error', () => {
				const validationErrors = [
					'Name is required',
					'Date is invalid',
				];
				const error = SyncError.validationFailed(
					'WorkEntry',
					'entry-123',
					validationErrors
				);

				expect(error.message).toBe(
					'Validation failed for WorkEntry entry-123: Name is required, Date is invalid'
				);
				expect(error.operation).toBe('VALIDATION');
				expect(error.entityType).toBe('WorkEntry');
				expect(error.entityId).toBe('entry-123');
				expect(error.retryable).toBe(false);
				expect(error.context?.validationErrors).toEqual(
					validationErrors
				);
			});
		});
	});

	describe('type checking methods', () => {
		it('should identify upload errors', () => {
			const uploadError = SyncError.uploadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);
			const downloadError = SyncError.downloadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);

			expect(uploadError.isUploadError()).toBe(true);
			expect(downloadError.isUploadError()).toBe(false);
		});

		it('should identify download errors', () => {
			const uploadError = SyncError.uploadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);
			const downloadError = SyncError.downloadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);

			expect(uploadError.isDownloadError()).toBe(false);
			expect(downloadError.isDownloadError()).toBe(true);
		});

		it('should identify conflict errors', () => {
			const conflictError = SyncError.conflict(
				'WorkEntry',
				'entry-123',
				1,
				2
			);
			const uploadError = SyncError.uploadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);

			expect(conflictError.isConflictError()).toBe(true);
			expect(uploadError.isConflictError()).toBe(false);
		});

		it('should check if error can be retried', () => {
			const retryableError = SyncError.uploadFailed(
				'WorkEntry',
				'entry-123',
				'Failed'
			);
			const nonRetryableError = SyncError.conflict(
				'WorkEntry',
				'entry-123',
				1,
				2
			);

			expect(retryableError.canRetry()).toBe(true);
			expect(nonRetryableError.canRetry()).toBe(false);
		});
	});
});
