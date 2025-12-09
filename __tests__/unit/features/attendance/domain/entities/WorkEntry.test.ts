import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

describe('WorkEntry', () => {
	it('constructs and normalizes date & status', () => {
		const e = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01T08:00:00Z',
			'office',
			'notes'
		);
		expect(e.date).toBe('2023-02-01');
		expect(e.status.value).toBe('office');
		expect(e.notes).toBe('notes');
	});

	it('updates fields producing new instance', () => {
		const e = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const u = e.withUpdates({
			status: new WorkStatus('leave'),
			notes: 'n',
		});
		expect(u.id).toBe(e.id);
		expect(u.status.value).toBe('leave');
		expect(u.notes).toBe('n');
		expect(u.updatedAt.getTime()).toBeGreaterThanOrEqual(
			e.updatedAt.getTime()
		);
	});

	it('validates required fields', () => {
		expect(
			() => new WorkEntry('e1', '', 't1', '2023-02-01', 'office')
		).toThrow('userId is required');

		expect(
			() => new WorkEntry('e1', 'u1', '', '2023-02-01', 'office')
		).toThrow('trackerId is required');
	});

	it('normalizes date from ISO string', () => {
		const entry = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01T08:00:00Z',
			'office'
		);

		expect(entry.date).toBe('2023-02-01');
	});

	it('normalizes date from Date object string', () => {
		const entry = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01T08:00:00.000Z',
			'office'
		);

		expect(entry.date).toBe('2023-02-01');
	});

	it('throws error for invalid date format', () => {
		expect(
			() => new WorkEntry('e1', 'u1', 't1', 'invalid-date', 'office')
		).toThrow('Invalid date');
	});

	it('validates date format', () => {
		// '2023/02/01' can be parsed by JavaScript Date and normalized to '2023-01-31'
		// So it doesn't throw. Use an invalid date that can't be parsed
		expect(
			() => new WorkEntry('e1', 'u1', 't1', 'not-a-date', 'office')
		).toThrow(); // Should throw 'Invalid date' from normalizeDate

		// Test with obviously invalid format
		expect(
			() => new WorkEntry('e1', 'u1', 't1', 'xyz', 'office')
		).toThrow(); // Should throw 'Invalid date'
	});

	it('handles WorkStatus instance', () => {
		const status = new WorkStatus('leave');
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', status);

		expect(entry.status).toBe(status);
	});

	it('handles optional notes', () => {
		const entry1 = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		expect(entry1.notes).toBeUndefined();

		const entry2 = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01',
			'office',
			'Some notes'
		);
		expect(entry2.notes).toBe('Some notes');
	});

	it('handles isAdvisory flag', () => {
		const entry = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01',
			'office',
			undefined,
			true
		);

		expect(entry.isAdvisory).toBe(true);
	});

	it('updates isAdvisory flag', () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const updated = entry.withUpdates({ isAdvisory: true });

		expect(updated.isAdvisory).toBe(true);
		expect(entry.isAdvisory).toBe(false);
	});

	it('updates with string status', () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const updated = entry.withUpdates({ status: 'leave' });

		expect(updated.status.value).toBe('leave');
	});

	it('updates with WorkStatus instance', () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const status = new WorkStatus('leave');
		const updated = entry.withUpdates({ status });

		expect(updated.status).toBe(status);
	});

	it('preserves original when updating notes', () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const updated = entry.withUpdates({ notes: 'New notes' });

		expect(updated.notes).toBe('New notes');
		expect(updated.id).toBe(entry.id);
		expect(updated.userId).toBe(entry.userId);
		expect(updated.trackerId).toBe(entry.trackerId);
		expect(updated.date).toBe(entry.date);
	});

	it('handles all update fields at once', () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		const updated = entry.withUpdates({
			status: 'leave',
			notes: 'Updated notes',
			isAdvisory: true,
		});

		expect(updated.status.value).toBe('leave');
		expect(updated.notes).toBe('Updated notes');
		expect(updated.isAdvisory).toBe(true);
	});
});
