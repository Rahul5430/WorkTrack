// Canonical work status values and type

export const WORK_STATUS = {
	OFFICE: 'office',
	WFH: 'wfh',
	HOLIDAY: 'holiday',
	LEAVE: 'leave',
	WEEKEND: 'weekend',
	FORECAST: 'forecast',
} as const;

export type WorkStatusType = (typeof WORK_STATUS)[keyof typeof WORK_STATUS];

export const WORK_STATUS_VALUES: ReadonlyArray<WorkStatusType> = Object.values(
	WORK_STATUS
) as ReadonlyArray<WorkStatusType>;
