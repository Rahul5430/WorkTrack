// Temporary stub for migration - will be replaced with actual implementation
export const WORK_STATUS = {
	OFFICE: 'office',
	HOLIDAY: 'holiday',
	WFH: 'wfh',
	ADVISORY: 'advisory',
} as const;

export const WORK_STATUS_COLORS = {
	office: '#007AFF',
	holiday: '#FF3B30',
	wfh: '#34C759',
	advisory: '#FF9500',
} as const;

export const WORK_STATUS_PRESSED_COLORS = {
	office: '#0056CC',
	holiday: '#CC2E24',
	wfh: '#2A9D47',
	advisory: '#CC7700',
} as const;
