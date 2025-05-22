export type MarkedDayStatus = 'WFH' | 'OFFICE' | 'HOLIDAY';

export type MarkedDay = {
	date: string;
	status: MarkedDayStatus;
};
