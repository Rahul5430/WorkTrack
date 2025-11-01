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
});
