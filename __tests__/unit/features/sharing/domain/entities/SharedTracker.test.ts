import { SharedTracker } from '@/features/sharing/domain/entities/SharedTracker';

describe('SharedTracker', () => {
	it('constructs with valid data', () => {
		const tracker = new SharedTracker(
			'tracker-1',
			't1',
			'owner-1',
			'My Tracker'
		);

		expect(tracker.id).toBe('tracker-1');
		expect(tracker.trackerId).toBe('t1');
		expect(tracker.ownerUserId).toBe('owner-1');
		expect(tracker.name).toBe('My Tracker');
		expect(tracker.createdAt).toBeInstanceOf(Date);
		expect(tracker.updatedAt).toBeInstanceOf(Date);
	});

	it('constructs with custom dates', () => {
		const createdAt = new Date('2024-01-01');
		const updatedAt = new Date('2024-01-02');
		const tracker = new SharedTracker(
			'tracker-1',
			't1',
			'owner-1',
			'My Tracker',
			createdAt,
			updatedAt
		);

		expect(tracker.createdAt).toEqual(createdAt);
		expect(tracker.updatedAt).toEqual(updatedAt);
	});

	it('throws error when trackerId is empty', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', '', 'owner-1', 'My Tracker');
		}).toThrow('trackerId is required');

		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', '   ', 'owner-1', 'My Tracker');
		}).toThrow('trackerId is required');
	});

	it('throws error when ownerUserId is empty', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', 't1', '', 'My Tracker');
		}).toThrow('ownerUserId is required');

		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', 't1', '   ', 'My Tracker');
		}).toThrow('ownerUserId is required');
	});

	it('throws error when name is empty', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', 't1', 'owner-1', '');
		}).toThrow('name is required');

		expect(() => {
			// eslint-disable-next-line no-new
			new SharedTracker('tracker-1', 't1', 'owner-1', '   ');
		}).toThrow('name is required');
	});

	it('inherits from BaseEntity', () => {
		const tracker = new SharedTracker(
			'tracker-1',
			't1',
			'owner-1',
			'My Tracker'
		);

		expect(tracker.id).toBeDefined();
		expect(tracker.createdAt).toBeInstanceOf(Date);
		expect(tracker.updatedAt).toBeInstanceOf(Date);
	});
});
