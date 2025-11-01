import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

describe('WorkStatus', () => {
	it('accepts valid statuses', () => {
		expect(new WorkStatus('present').value).toBe('present');
		expect(new WorkStatus('ABSENT').value).toBe('absent');
	});

	it('rejects invalid statuses', () => {
		expect(() => new WorkStatus('invalid')).toThrow('Invalid work status');
	});

	it('equals compares value', () => {
		const a = new WorkStatus('wfh');
		const b = new WorkStatus('WFH');
		expect(a.equals(b)).toBe(true);
	});
});
