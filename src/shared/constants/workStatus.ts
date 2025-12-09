// Work status constants (UI concerns) built on top of shared types
import { WORK_STATUS, type WorkStatusType } from '@/shared/types/workStatus';

export { WORK_STATUS, type WorkStatusType };

export const WORK_STATUS_COLORS = {
	[WORK_STATUS.OFFICE]: '#2196F3',
	[WORK_STATUS.WFH]: '#4CAF50',
	[WORK_STATUS.HOLIDAY]: '#FF9800',
	[WORK_STATUS.LEAVE]: '#DBEAFE',
	[WORK_STATUS.WEEKEND]: '#FFEDD5',
	[WORK_STATUS.FORECAST]: '#9C27B0',
	[WORK_STATUS.ADVISORY]: '#9C27B0',
} as const;

export const WORK_STATUS_PRESSED_COLORS = {
	[WORK_STATUS.OFFICE]: '#1976D2',
	[WORK_STATUS.WFH]: '#388E3C',
	[WORK_STATUS.HOLIDAY]: '#F57C00',
	[WORK_STATUS.LEAVE]: '#BFDBFE',
	[WORK_STATUS.WEEKEND]: '#FED7AA',
	[WORK_STATUS.FORECAST]: '#7B1FA2',
	[WORK_STATUS.ADVISORY]: '#7B1FA2',
} as const;

export const WORK_STATUS_LABELS = {
	[WORK_STATUS.OFFICE]: 'Office',
	[WORK_STATUS.WFH]: 'WFH',
	[WORK_STATUS.HOLIDAY]: 'Holiday',
	[WORK_STATUS.LEAVE]: 'Leave',
	[WORK_STATUS.WEEKEND]: 'Weekend',
	[WORK_STATUS.FORECAST]: 'Forecast',
	[WORK_STATUS.ADVISORY]: 'Advisory',
} as const;
