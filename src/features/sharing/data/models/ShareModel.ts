import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

export default class ShareModel extends Model {
	static table = 'shares';

	@field('tracker_id') trackerId!: string;
	@field('shared_with_user_id') sharedWithUserId!: string;
	@field('permission') permission!: string; // 'read' | 'write'
	@field('is_active') isActive!: boolean;
	@field('created_by_user_id') createdByUserId!: string;
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
}
