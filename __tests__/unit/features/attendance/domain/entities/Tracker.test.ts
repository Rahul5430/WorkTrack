import { Tracker } from '@/features/attendance/domain/entities/Tracker';

describe('Tracker', () => {
	it('constructs with valid data', () => {
		const t = new Tracker('t1', 'Main');
		expect(t.id).toBe('t1');
		expect(t.name).toBe('Main');
		expect(t.isActive).toBe(true);
	});

	it('validates name', () => {
		expect(() => new Tracker('t1', '')).toThrow('Tracker name is required');
	});

	it('activate/deactivate returns new instance', () => {
		const t = new Tracker('t1', 'Main', undefined, false);
		const a = t.activate();
		expect(a.isActive).toBe(true);
		const d = a.deactivate();
		expect(d.isActive).toBe(false);
	});

	it('handles optional description', () => {
		const tracker1 = new Tracker('t1', 'Main');
		expect(tracker1.description).toBeUndefined();

		const tracker2 = new Tracker('t2', 'Main', 'Description');
		expect(tracker2.description).toBe('Description');
	});

	it('defaults to active when not specified', () => {
		const tracker = new Tracker('t1', 'Main');
		expect(tracker.isActive).toBe(true);
	});

	it('can be created as inactive', () => {
		const tracker = new Tracker('t1', 'Main', undefined, false);
		expect(tracker.isActive).toBe(false);
	});

	it('validates empty name string', () => {
		expect(() => new Tracker('t1', '   ')).toThrow(
			'Tracker name is required'
		);
	});

	it('validates name length limit', () => {
		const longName = 'a'.repeat(101);
		expect(() => new Tracker('t1', longName)).toThrow(
			'Tracker name must be <= 100 chars'
		);
	});

	it('allows name at max length', () => {
		const maxName = 'a'.repeat(100);
		const tracker = new Tracker('t1', maxName);
		expect(tracker.name).toBe(maxName);
	});

	it('preserves id when activating', () => {
		const tracker = new Tracker('t1', 'Main', undefined, false);
		const activated = tracker.activate();

		expect(activated.id).toBe(tracker.id);
		expect(activated.name).toBe(tracker.name);
		expect(activated.description).toBe(tracker.description);
		expect(activated.isActive).toBe(true);
	});

	it('preserves id when deactivating', () => {
		const tracker = new Tracker('t1', 'Main');
		const deactivated = tracker.deactivate();

		expect(deactivated.id).toBe(tracker.id);
		expect(deactivated.name).toBe(tracker.name);
		expect(deactivated.description).toBe(tracker.description);
		expect(deactivated.isActive).toBe(false);
	});

	it('updates timestamp when activating', () => {
		const tracker = new Tracker('t1', 'Main', undefined, false);
		const originalUpdatedAt = tracker.updatedAt.getTime();
		const beforeActivate = Date.now();
		const activated = tracker.activate();

		expect(activated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeActivate
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (activated.updatedAt.getTime() <= originalUpdatedAt) {
			expect(activated.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(activated.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('updates timestamp when deactivating', () => {
		const tracker = new Tracker('t1', 'Main');
		const originalUpdatedAt = tracker.updatedAt.getTime();
		const beforeDeactivate = Date.now();
		const deactivated = tracker.deactivate();

		expect(deactivated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeDeactivate
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (deactivated.updatedAt.getTime() <= originalUpdatedAt) {
			expect(deactivated.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(deactivated.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('preserves createdAt when activating/deactivating', () => {
		const tracker = new Tracker('t1', 'Main');
		const activated = tracker.activate();
		const deactivated = activated.deactivate();

		expect(activated.createdAt).toEqual(tracker.createdAt);
		expect(deactivated.createdAt).toEqual(tracker.createdAt);
	});

	it('handles description when activating', () => {
		const tracker = new Tracker('t1', 'Main', 'Test description', false);
		const activated = tracker.activate();

		expect(activated.description).toBe('Test description');
	});

	it('handles description when deactivating', () => {
		const tracker = new Tracker('t1', 'Main', 'Test description');
		const deactivated = tracker.deactivate();

		expect(deactivated.description).toBe('Test description');
	});
});
