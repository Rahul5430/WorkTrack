import { colors } from '../themes/colors';
import { MarkedDayStatus } from '../types/calendar';

export const WORK_STATUS = {
	OFFICE: 'office',
	WFH: 'wfh',
	HOLIDAY: 'holiday',
} as const;

export const WORK_STATUS_COLORS: Record<MarkedDayStatus, string> = {
	[WORK_STATUS.OFFICE]: colors.office,
	[WORK_STATUS.WFH]: colors.wfh,
	[WORK_STATUS.HOLIDAY]: colors.holiday,
};

export const WORK_STATUS_BACKGROUND_COLORS: Record<MarkedDayStatus, string> = {
	[WORK_STATUS.OFFICE]: colors.background.office,
	[WORK_STATUS.WFH]: colors.background.wfh,
	[WORK_STATUS.HOLIDAY]: colors.background.holiday,
};

export const WORK_STATUS_PRESSED_COLORS: Record<MarkedDayStatus, string> = {
	[WORK_STATUS.OFFICE]: colors.button.primaryPressed,
	[WORK_STATUS.WFH]: colors.button.primaryPressed,
	[WORK_STATUS.HOLIDAY]: colors.background.secondary,
};

export const WORK_STATUS_LABELS = {
	[WORK_STATUS.OFFICE]: 'Office',
	[WORK_STATUS.WFH]: 'WFH',
	[WORK_STATUS.HOLIDAY]: 'Holiday',
} as const;
