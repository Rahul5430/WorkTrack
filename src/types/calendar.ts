export type MarkedDayStatus =
	| 'office'
	| 'wfh'
	| 'holiday'
	| 'leave'
	| 'advisory';

export type MarkedDay = {
	date: string;
	status: MarkedDayStatus;
	isAdvisory?: boolean;
};
