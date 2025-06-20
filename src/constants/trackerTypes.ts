export const TRACKER_TYPES = {
	WORK_TRACK: 'work_track',
} as const;

export type TrackerType = (typeof TRACKER_TYPES)[keyof typeof TRACKER_TYPES];

export const DEFAULT_TRACKER_TYPE = TRACKER_TYPES.WORK_TRACK;
