import { appSchema } from '@nozbe/watermelondb';

import { workTrackSchema } from './worktrack/schema';

export const schema = appSchema({
	version: 1,
	tables: [workTrackSchema],
});
