// WatermelonDB model for WorkEntry
import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

export default class WorkEntryModel extends Model {
	static table = 'work_entries';

	@field('user_id') userId!: string;
	@field('tracker_id') trackerId!: string;
	@field('date') date!: string;
	@field('status') status!: string;
	@field('notes') notes?: string;
	@field('is_advisory') isAdvisory!: boolean;
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
}
