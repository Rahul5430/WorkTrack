import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

describe('WorkStatus', () => {
	it('accepts valid statuses', () => {
		expect(new WorkStatus('office').value).toBe('office');
		expect(new WorkStatus('WFH').value).toBe('wfh');
		expect(new WorkStatus('holiday').value).toBe('holiday');
		expect(new WorkStatus('leave').value).toBe('leave');
		expect(new WorkStatus('weekend').value).toBe('weekend');
		expect(new WorkStatus('FORECAST').value).toBe('forecast');
		expect(new WorkStatus('ADVISORY').value).toBe('advisory');
	});

	it('rejects invalid statuses', () => {
		expect(() => new WorkStatus('invalid')).toThrow('Invalid work status');
	});

	it('equals compares value', () => {
		const a = new WorkStatus('wfh');
		const b = new WorkStatus('WFH');
		expect(a.equals(b)).toBe(true);
	});

	it('returns false when comparing with null or undefined', () => {
		const status = new WorkStatus('office');
		expect(status.equals(null)).toBe(false);
		expect(status.equals(undefined)).toBe(false);
	});

	it('toString returns the status value', () => {
		const status = new WorkStatus('office');
		expect(status.toString()).toBe('office');
	});

	it('toString returns the correct value for different statuses', () => {
		expect(new WorkStatus('wfh').toString()).toBe('wfh');
		expect(new WorkStatus('leave').toString()).toBe('leave');
		expect(new WorkStatus('holiday').toString()).toBe('holiday');
		expect(new WorkStatus('weekend').toString()).toBe('weekend');
		expect(new WorkStatus('forecast').toString()).toBe('forecast');
		expect(new WorkStatus('advisory').toString()).toBe('advisory');
	});
});
