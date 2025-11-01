import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

describe('WorkEntry', () => {
	it('constructs and normalizes date & status', () => {
		const e = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01T08:00:00Z',
			'present',
			'notes'
		);
		expect(e.date).toBe('2023-02-01');
		expect(e.status.value).toBe('present');
		expect(e.notes).toBe('notes');
	});

	it('updates fields producing new instance', () => {
		const e = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'present');
		const u = e.withUpdates({
			status: new WorkStatus('absent'),
			notes: 'n',
		});
		expect(u.id).toBe(e.id);
		expect(u.status.value).toBe('absent');
		expect(u.notes).toBe('n');
		expect(u.updatedAt.getTime()).toBeGreaterThanOrEqual(
			e.updatedAt.getTime()
		);
	});

	it('validates required fields', () => {
		expect(
			() => new WorkEntry('e1', '', 't1', '2023-02-01', 'present')
		).toThrow('userId is required');
	});
});
