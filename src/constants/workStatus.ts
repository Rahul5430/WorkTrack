import { colors } from '../themes';
import { MarkedDayStatus } from '../types/calendar';

export const WORK_STATUS = {
	OFFICE: 'office',
	WFH: 'wfh',
	HOLIDAY: 'holiday',
	LEAVE: 'leave',
	ADVISORY: 'advisory',
} as const;

export const WORK_STATUS_COLORS = {
	[WORK_STATUS.OFFICE]: colors.office,
	[WORK_STATUS.WFH]: colors.wfh,
	[WORK_STATUS.HOLIDAY]: colors.holiday,
	[WORK_STATUS.LEAVE]: colors.error,
	[WORK_STATUS.ADVISORY]: colors.forecast,
} as const;

export const WORK_STATUS_BACKGROUND_COLORS: Record<MarkedDayStatus, string> = {
	[WORK_STATUS.OFFICE]: colors.background.office,
	[WORK_STATUS.WFH]: colors.background.wfh,
	[WORK_STATUS.LEAVE]: colors.background.error,
	[WORK_STATUS.HOLIDAY]: colors.background.holiday,
	[WORK_STATUS.ADVISORY]: colors.background.forecast,
};

export const WORK_STATUS_PRESSED_COLORS = {
	[WORK_STATUS.OFFICE]: colors.button.primaryPressed,
	[WORK_STATUS.WFH]: colors.button.primaryPressed,
	[WORK_STATUS.HOLIDAY]: colors.holiday,
	[WORK_STATUS.LEAVE]: colors.error,
	[WORK_STATUS.ADVISORY]: colors.forecast,
} as const;

export const WORK_STATUS_LABELS = {
	[WORK_STATUS.OFFICE]: 'Office',
	[WORK_STATUS.WFH]: 'WFH',
	[WORK_STATUS.HOLIDAY]: 'Holiday',
	[WORK_STATUS.LEAVE]: 'Leave',
	[WORK_STATUS.ADVISORY]: 'Advisory',
} as const;
