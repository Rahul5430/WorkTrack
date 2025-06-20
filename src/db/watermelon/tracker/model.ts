import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

import { TrackerType } from '../../../constants/trackerTypes';

export default class Tracker extends Model {
	static readonly table = 'trackers';

	@field('owner_id') ownerId!: string;
	@field('name') name!: string;
	@field('color') color!: string;
	@readonly @date('created_at') createdAt!: Date;
	@field('is_default') isDefault!: boolean;
	@field('tracker_type') trackerType!: TrackerType;
}
