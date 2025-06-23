import { Model } from '@nozbe/watermelondb';
import {
	date,
	field,
	readonly,
	relation,
} from '@nozbe/watermelondb/decorators';

import { MarkedDayStatus } from '../../../types/calendar';
import Tracker from '../tracker/model';

export default class WorkTrack extends Model {
	static readonly table = 'work_tracks';

	static readonly associations = {
		trackers: { type: 'belongs_to', key: 'tracker_id' },
	} as const;

	@field('date') date!: string;
	@field('status') status!: MarkedDayStatus;
	@field('is_advisory') isAdvisory!: boolean;
	@field('tracker_id') trackerId!: string;
	@field('needs_sync') needsSync!: boolean;
	@field('sync_error') syncError?: string;
	@field('retry_count') retryCount?: number;
	@readonly @date('created_at') createdAt!: Date;
	@field('last_modified') lastModified!: number;

	@relation('trackers', 'tracker_id') tracker?: Tracker;

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
