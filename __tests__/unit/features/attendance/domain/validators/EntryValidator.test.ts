import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';
import { EntryValidator } from '@/features/attendance/domain/validators/EntryValidator';

describe('EntryValidator', () => {
	describe('validate', () => {
		it('validates entry with all required fields', () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office')
			);

			expect(() => EntryValidator.validate(entry)).not.toThrow();
			// Ensure status.value is accessed (line 11)
			expect(entry.status.value).toBe('office');
		});

		it('throws error when userId is missing', () => {
			// WorkEntry constructor validates userId, so we can't create entry with empty userId
			// EntryValidator.validate also checks userId, but it's meant for runtime validation
			// Test validator logic directly with mock entry object
			const mockEntry = {
				userId: '',
				trackerId: 'tracker-1',
				status: new WorkStatus('office'),
			} as WorkEntry;
			expect(() => EntryValidator.validate(mockEntry)).toThrow(
				'userId is required'
			);
		});

		it('throws error when trackerId is missing', () => {
			// Similar to userId test: constructor validates trackerId
			// Test validator logic directly with mock entry object
			const mockEntry = {
				userId: 'user-1',
				trackerId: '',
				status: new WorkStatus('office'),
			} as WorkEntry;
			expect(() => EntryValidator.validate(mockEntry)).toThrow(
				'trackerId is required'
			);
		});

		it('throws error when userId is null', () => {
			const mockEntry = {
				userId: null as unknown as string,
				trackerId: 'tracker-1',
				status: new WorkStatus('office'),
			} as WorkEntry;
			expect(() => EntryValidator.validate(mockEntry)).toThrow(
				'userId is required'
			);
		});

		it('throws error when trackerId is null', () => {
			const mockEntry = {
				userId: 'user-1',
				trackerId: null as unknown as string,
				status: new WorkStatus('office'),
			} as WorkEntry;
			expect(() => EntryValidator.validate(mockEntry)).toThrow(
				'trackerId is required'
			);
		});

		it('validates status through status.value access', () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('wfh')
			);

			expect(() => EntryValidator.validate(entry)).not.toThrow();
			expect(entry.status.value).toBe('wfh');
		});

		it('validates entry with all optional fields', () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office'),
				'Test notes',
				true
			);

			expect(() => EntryValidator.validate(entry)).not.toThrow();
			expect(entry.notes).toBe('Test notes');
			expect(entry.isAdvisory).toBe(true);
		});
	});

	describe('canTransition', () => {
		it('allows all transitions', () => {
			const from = new WorkStatus('office');
			const to = new WorkStatus('wfh');

			expect(EntryValidator.canTransition(from, to)).toBe(true);
		});

		it('allows transition from present to present', () => {
			const from = new WorkStatus('office');
			const to = new WorkStatus('office');

			expect(EntryValidator.canTransition(from, to)).toBe(true);
		});

		// removed test for unsupported status 'absent'

		it('allows transition from present to leave', () => {
			const from = new WorkStatus('office');
			const to = new WorkStatus('leave');

			expect(EntryValidator.canTransition(from, to)).toBe(true);
		});
	});
});
