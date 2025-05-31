import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

import { MarkedDayStatus } from '../../../types/calendar';

export default class WorkTrack extends Model {
	static readonly table = 'work_tracks';

	@field('date') date!: string;
	@field('status') status!: MarkedDayStatus;
	@field('is_advisory') isAdvisory!: boolean;
	@readonly @date('created_at') createdAt!: Date;
	@field('synced') synced!: boolean;
	@field('sync_error') syncError?: string;
	@field('last_modified') lastModified!: number;

	// Validation method
	validate() {
		if (!this.date || !this.status) {
			throw new Error('Invalid entry: missing required fields');
		}
		if (
			!Object.values(['wfh', 'office', 'holiday', 'leave']).includes(
				this.status
			)
		) {
			throw new Error('Invalid status value');
		}
	}
}
