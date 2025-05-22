import { MarkedDayStatus } from '../types/calendar';

export const WORK_STATUS = {
	OFFICE: 'OFFICE',
	WFH: 'WFH',
	HOLIDAY: 'HOLIDAY',
} as const;

export const WORK_STATUS_COLORS = {
	[WORK_STATUS.OFFICE]: '#2196F3',
	[WORK_STATUS.WFH]: '#4CAF50',
	[WORK_STATUS.HOLIDAY]: '#FF9800',
} as const;

export const WORK_STATUS_LABELS = {
	[WORK_STATUS.OFFICE]: 'Office',
	[WORK_STATUS.WFH]: 'WFH',
	[WORK_STATUS.HOLIDAY]: 'Holiday',
} as const;

export const WORK_STATUS_BACKGROUND_COLORS = {
	[WORK_STATUS.OFFICE]: '#2196F315',
	[WORK_STATUS.WFH]: '#4CAF5015',
	[WORK_STATUS.HOLIDAY]: '#FF525215',
} as const;
