export type MarkedDayStatus = 'office' | 'wfh' | 'holiday' | 'leave';

export type MarkedDay = {
	date: string;
	status: MarkedDayStatus;
	isAdvisory?: boolean;
};
