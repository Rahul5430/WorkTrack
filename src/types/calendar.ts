export type MarkedDayStatus = 'office' | 'wfh' | 'leave' | 'holiday';

export type MarkedDay = {
	date: string;
	status: MarkedDayStatus;
};
