import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';

describe('Share', () => {
	it('constructs with valid data', () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		expect(share.trackerId).toBe('t1');
		expect(share.sharedWithUserId).toBe('u2');
		expect(share.permission.value).toBe('read');
		expect(share.isActive).toBe(true);
	});

	it('updates permission', () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		const updated = share.withPermission('write');
		expect(updated.permission.value).toBe('write');
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			share.updatedAt.getTime()
		);
	});

	it('deactivates share', () => {
		const share = new Share('s1', 't1', 'u2', 'write');
		const off = share.deactivate();
		expect(off.isActive).toBe(false);
	});

	it('permission validation', () => {
		expect(() => new Permission('read')).not.toThrow();
		expect(() => new Permission('write')).not.toThrow();
		// @ts-expect-error invalid
		expect(() => new Permission('admin')).toThrow();
	});
});
