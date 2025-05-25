export type MarkedDayStatus = 'wfh' | 'office' | 'holiday';

export type MarkedDay = {
	date: string;
	status: MarkedDayStatus;
};
