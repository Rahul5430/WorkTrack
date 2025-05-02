import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export default class WorkTrack extends Model {
	static table = 'work_tracks';

	@field('date') date!: string;
	@field('status') status!: 'wfh' | 'office' | 'holiday';
	@readonly @date('created_at') createdAt!: Date;
	@field('synced') synced!: boolean;
}
