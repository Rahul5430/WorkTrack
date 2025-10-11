import { MarkedDay, MarkedDayStatus } from '../../../src/types/calendar';

// Runtime utility functions to test the types
const isValidMarkedDayStatus = (status: string): status is MarkedDayStatus => {
	return ['office', 'wfh', 'holiday', 'leave', 'advisory'].includes(status);
};

const createMarkedDay = (
	date: string,
	status: MarkedDayStatus,
	isAdvisory?: boolean
): MarkedDay => {
	return {
		date,
		status,
		isAdvisory,
	};
};

const validateMarkedDay = (day: unknown): day is MarkedDay => {
	if (typeof day !== 'object' || day === null) {
		return false;
	}

	const markedDay = day as Record<string, unknown>;

	return (
		typeof markedDay.date === 'string' &&
		isValidMarkedDayStatus(markedDay.status as string) &&
		(markedDay.isAdvisory === undefined ||
			typeof markedDay.isAdvisory === 'boolean')
	);
};

const getStatusDisplayName = (status: MarkedDayStatus): string => {
	switch (status) {
		case 'office':
			return 'Office';
		case 'wfh':
			return 'Work From Home';
		case 'holiday':
			return 'Holiday';
		case 'leave':
			return 'Leave';
		case 'advisory':
			return 'Advisory';
		default:
			return 'Unknown';
	}
};

const isWorkDay = (status: MarkedDayStatus): boolean => {
	return status === 'office' || status === 'wfh';
};

const isNonWorkDay = (status: MarkedDayStatus): boolean => {
	return status === 'holiday' || status === 'leave';
};

const formatMarkedDay = (day: MarkedDay): string => {
	const displayName = getStatusDisplayName(day.status);
	const advisoryText = day.isAdvisory ? ' (Advisory)' : '';
	return `${day.date}: ${displayName}${advisoryText}`;
};

describe('Calendar Types', () => {
	describe('MarkedDayStatus type', () => {
		it('should accept valid status values', () => {
			const statuses: MarkedDayStatus[] = [
				'office',
				'wfh',
				'holiday',
				'leave',
				'advisory',
			];

			statuses.forEach((status) => {
				expect(typeof status).toBe('string');
				expect(isValidMarkedDayStatus(status)).toBe(true);
				expect([
					'office',
					'wfh',
					'holiday',
					'leave',
					'advisory',
				]).toContain(status);
			});
		});

		it('should validate invalid status values', () => {
			expect(isValidMarkedDayStatus('invalid')).toBe(false);
			expect(isValidMarkedDayStatus('')).toBe(false);
			expect(isValidMarkedDayStatus('WORK')).toBe(false);
		});
	});

	describe('MarkedDay type', () => {
		it('should accept valid MarkedDay objects', () => {
			const validMarkedDay = createMarkedDay(
				'2025-01-01',
				'office',
				false
			);

			expect(validMarkedDay.date).toBe('2025-01-01');
			expect(validMarkedDay.status).toBe('office');
			expect(validMarkedDay.isAdvisory).toBe(false);
		});

		it('should accept advisory days', () => {
			const advisoryDay = createMarkedDay('2025-01-02', 'wfh', true);

			expect(advisoryDay.isAdvisory).toBe(true);
			expect(advisoryDay.status).toBe('wfh');
		});

		it('should accept all status types', () => {
			const officeDay = createMarkedDay('2025-01-03', 'office', false);
			const wfhDay = createMarkedDay('2025-01-04', 'wfh', false);
			const leaveDay = createMarkedDay('2025-01-05', 'leave', false);
			const holidayDay = createMarkedDay('2025-01-06', 'holiday', false);
			const advisoryDay = createMarkedDay(
				'2025-01-07',
				'advisory',
				false
			);

			expect(officeDay.status).toBe('office');
			expect(wfhDay.status).toBe('wfh');
			expect(leaveDay.status).toBe('leave');
			expect(holidayDay.status).toBe('holiday');
			expect(advisoryDay.status).toBe('advisory');
		});

		it('should handle optional isAdvisory property', () => {
			const dayWithoutAdvisory = createMarkedDay('2025-01-08', 'office');

			expect(dayWithoutAdvisory.isAdvisory).toBeUndefined();
			expect(dayWithoutAdvisory.date).toBe('2025-01-08');
			expect(dayWithoutAdvisory.status).toBe('office');
		});

		it('should create MarkedDay objects with all combinations', () => {
			const combinations = [
				createMarkedDay('2025-01-09', 'office', true),
				createMarkedDay('2025-01-10', 'wfh', false),
				createMarkedDay('2025-01-11', 'holiday'),
				createMarkedDay('2025-01-12', 'leave', true),
				createMarkedDay('2025-01-13', 'advisory', false),
			];

			combinations.forEach((day) => {
				expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(isValidMarkedDayStatus(day.status)).toBe(true);
				expect(typeof day.date).toBe('string');
			});
		});
	});

	describe('Calendar Utility Functions', () => {
		it('should validate MarkedDay objects correctly', () => {
			const validDay = createMarkedDay('2025-01-14', 'office', false);
			expect(validateMarkedDay(validDay)).toBe(true);

			expect(validateMarkedDay(null)).toBe(false);
			expect(validateMarkedDay(undefined)).toBe(false);
			expect(validateMarkedDay('invalid')).toBe(false);
			expect(validateMarkedDay({})).toBe(false);
			expect(
				validateMarkedDay({ date: '2025-01-14', status: 'invalid' })
			).toBe(false);
			expect(validateMarkedDay({ date: 123, status: 'office' })).toBe(
				false
			);
		});

		it('should get correct status display names', () => {
			expect(getStatusDisplayName('office')).toBe('Office');
			expect(getStatusDisplayName('wfh')).toBe('Work From Home');
			expect(getStatusDisplayName('holiday')).toBe('Holiday');
			expect(getStatusDisplayName('leave')).toBe('Leave');
			expect(getStatusDisplayName('advisory')).toBe('Advisory');
		});

		it('should identify work days correctly', () => {
			expect(isWorkDay('office')).toBe(true);
			expect(isWorkDay('wfh')).toBe(true);
			expect(isWorkDay('holiday')).toBe(false);
			expect(isWorkDay('leave')).toBe(false);
			expect(isWorkDay('advisory')).toBe(false);
		});

		it('should identify non-work days correctly', () => {
			expect(isNonWorkDay('holiday')).toBe(true);
			expect(isNonWorkDay('leave')).toBe(true);
			expect(isNonWorkDay('office')).toBe(false);
			expect(isNonWorkDay('wfh')).toBe(false);
			expect(isNonWorkDay('advisory')).toBe(false);
		});

		it('should format MarkedDay objects correctly', () => {
			const officeDay = createMarkedDay('2025-01-15', 'office', false);
			const advisoryDay = createMarkedDay('2025-01-16', 'wfh', true);

			expect(formatMarkedDay(officeDay)).toBe('2025-01-15: Office');
			expect(formatMarkedDay(advisoryDay)).toBe(
				'2025-01-16: Work From Home (Advisory)'
			);
		});

		it('should handle all status combinations with utilities', () => {
			const testCases = [
				{ status: 'office' as MarkedDayStatus, isAdvisory: false },
				{ status: 'wfh' as MarkedDayStatus, isAdvisory: true },
				{ status: 'holiday' as MarkedDayStatus, isAdvisory: false },
				{ status: 'leave' as MarkedDayStatus, isAdvisory: true },
				{ status: 'advisory' as MarkedDayStatus, isAdvisory: false },
			];

			testCases.forEach(({ status, isAdvisory }) => {
				const day = createMarkedDay('2025-01-17', status, isAdvisory);

				expect(validateMarkedDay(day)).toBe(true);
				expect(isValidMarkedDayStatus(day.status)).toBe(true);
				expect(getStatusDisplayName(day.status)).toBeTruthy();
				expect(formatMarkedDay(day)).toContain(day.date);
				expect(formatMarkedDay(day)).toContain(
					getStatusDisplayName(day.status)
				);

				if (isAdvisory) {
					expect(formatMarkedDay(day)).toContain('(Advisory)');
				}
			});
		});
	});
});
