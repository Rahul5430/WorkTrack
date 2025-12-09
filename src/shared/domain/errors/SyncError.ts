import type { SerializableRecord } from '@/shared/types/serialization';

import { AppError } from './AppError';

/**
 * Error thrown when sync operations fail
 */
export class SyncError extends AppError {
	public readonly operation: string;
	public readonly entityType?: string;
	public readonly entityId?: string;
	public readonly retryable: boolean;

	constructor(
		message: string,
		operation: string,
		entityType?: string,
		entityId?: string,
		retryable: boolean = true,
		context?: SerializableRecord
	) {
		super(message, 'SYNC_ERROR', 500, {
			operation,
			entityType,
			entityId,
			retryable,
			...context,
		});

		this.operation = operation;
		this.entityType = entityType;
		this.entityId = entityId;
		this.retryable = retryable;
	}

	/**
	 * Create a sync error for a failed upload
	 */
	static uploadFailed(
		entityType: string,
		entityId: string,
		reason: string,
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Failed to upload ${entityType} ${entityId}: ${reason}`,
			'UPLOAD',
			entityType,
			entityId,
			true,
			context
		);
	}

	/**
	 * Create a sync error for a failed download
	 */
	static downloadFailed(
		entityType: string,
		entityId: string,
		reason: string,
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Failed to download ${entityType} ${entityId}: ${reason}`,
			'DOWNLOAD',
			entityType,
			entityId,
			true,
			context
		);
	}

	/**
	 * Create a sync error for a conflict
	 */
	static conflict(
		entityType: string,
		entityId: string,
		localVersion: number,
		remoteVersion: number,
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Sync conflict for ${entityType} ${entityId}: local version ${localVersion} conflicts with remote version ${remoteVersion}`,
			'CONFLICT',
			entityType,
			entityId,
			false,
			{
				localVersion,
				remoteVersion,
				...context,
			}
		);
	}

	/**
	 * Create a sync error for a network issue
	 */
	static networkIssue(
		operation: string,
		reason: string,
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Network issue during ${operation}: ${reason}`,
			operation,
			undefined,
			undefined,
			true,
			context
		);
	}

	/**
	 * Create a sync error for a server error
	 */
	static serverError(
		operation: string,
		statusCode: number,
		reason: string,
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Server error during ${operation}: ${statusCode} - ${reason}`,
			operation,
			undefined,
			undefined,
			true,
			{
				statusCode,
				...context,
			}
		);
	}

	/**
	 * Create a sync error for a validation failure
	 */
	static validationFailed(
		entityType: string,
		entityId: string,
		validationErrors: string[],
		context?: SerializableRecord
	): SyncError {
		return new SyncError(
			`Validation failed for ${entityType} ${entityId}: ${validationErrors.join(', ')}`,
			'VALIDATION',
			entityType,
			entityId,
			false,
			{
				validationErrors,
				...context,
			}
		);
	}

	/**
	 * Check if this is an upload error
	 */
	isUploadError(): boolean {
		return this.operation === 'UPLOAD';
	}

	/**
	 * Check if this is a download error
	 */
	isDownloadError(): boolean {
		return this.operation === 'DOWNLOAD';
	}

	/**
	 * Check if this is a conflict error
	 */
	isConflictError(): boolean {
		return this.operation === 'CONFLICT';
	}

	/**
	 * Check if this error can be retried
	 */
	canRetry(): boolean {
		return this.retryable;
	}
}
