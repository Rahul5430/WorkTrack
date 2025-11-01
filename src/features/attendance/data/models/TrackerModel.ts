// WatermelonDB model for Tracker
import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

export default class TrackerModel extends Model {
	static table = 'trackers';

	@field('name') name!: string;
	@field('description') description?: string;
	@field('user_id') userId!: string;
	@field('is_active') isActive!: boolean;
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
}
