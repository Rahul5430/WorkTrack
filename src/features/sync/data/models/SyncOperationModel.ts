// WatermelonDB model for SyncOperation
import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

export default class SyncOperationModel extends Model {
	static table = 'sync_queue';

	@field('operation') operation!: string;
	@field('table_name') tableName!: string;
	@field('record_id') recordId!: string;
	@field('data') data?: string; // JSON string
	@field('status') status!: string;
	@field('retry_count') retryCount!: number;
	@field('max_retries') maxRetries!: number;
	@field('attempt_count') attemptCount?: number;
	@field('error_message') errorMessage?: string;
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
	@date('next_retry_at') nextRetryAt?: Date;
}
