import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export default class SharedTracker extends Model {
	static readonly table = 'shared_trackers';

	@field('tracker_id') trackerId!: string;
	@field('shared_with') sharedWith!: string;
	@field('permission') permission!: 'read' | 'write';
	@readonly @date('created_at') createdAt!: Date;
}
