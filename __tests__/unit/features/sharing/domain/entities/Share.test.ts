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

	it('constructs with Permission instance', () => {
		const permission = new Permission('write');
		const share = new Share('s1', 't1', 'u2', permission);

		expect(share.permission).toBe(permission);
		expect(share.permission.value).toBe('write');
	});

	it('constructs with permission string', () => {
		const share = new Share('s1', 't1', 'u2', 'read');

		expect(share.permission.value).toBe('read');
		expect(share.permission).toBeInstanceOf(Permission);
	});

	it('defaults to active when not specified', () => {
		const share = new Share('s1', 't1', 'u2', 'read');

		expect(share.isActive).toBe(true);
	});

	it('can be created as inactive', () => {
		const share = new Share('s1', 't1', 'u2', 'read', false);

		expect(share.isActive).toBe(false);
	});

	it('validates trackerId is required', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new Share('s1', '', 'u2', 'read');
		}).toThrow('trackerId is required');

		expect(() => {
			// eslint-disable-next-line no-new
			new Share('s1', '   ', 'u2', 'read');
		}).toThrow('trackerId is required');
	});

	it('validates sharedWithUserId is required', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new Share('s1', 't1', '', 'read');
		}).toThrow('sharedWithUserId is required');

		expect(() => {
			// eslint-disable-next-line no-new
			new Share('s1', 't1', '   ', 'read');
		}).toThrow('sharedWithUserId is required');
	});

	it('preserves original when updating permission', () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		const updated = share.withPermission('write');

		expect(updated.id).toBe(share.id);
		expect(updated.trackerId).toBe(share.trackerId);
		expect(updated.sharedWithUserId).toBe(share.sharedWithUserId);
		expect(updated.isActive).toBe(share.isActive);
		expect(updated.permission.value).toBe('write');
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			share.updatedAt.getTime()
		);
	});

	it('preserves original when deactivating', () => {
		const share = new Share('s1', 't1', 'u2', 'write');
		const deactivated = share.deactivate();

		expect(deactivated.id).toBe(share.id);
		expect(deactivated.trackerId).toBe(share.trackerId);
		expect(deactivated.sharedWithUserId).toBe(share.sharedWithUserId);
		expect(deactivated.permission).toEqual(share.permission);
		expect(deactivated.isActive).toBe(false);
		expect(deactivated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			share.updatedAt.getTime()
		);
	});

	it('updates timestamp when changing permission', () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		const originalUpdatedAt = share.updatedAt.getTime();
		const beforeUpdate = Date.now();
		const updated = share.withPermission('write');

		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeUpdate
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (updated.updatedAt.getTime() <= originalUpdatedAt) {
			expect(updated.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(updated.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('updates timestamp when deactivating', () => {
		const share = new Share('s1', 't1', 'u2', 'write');
		const originalUpdatedAt = share.updatedAt.getTime();
		const beforeDeactivate = Date.now();
		const deactivated = share.deactivate();

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

	it('preserves createdAt when updating', () => {
		const share = new Share('s1', 't1', 'u2', 'read');
		const updated = share.withPermission('write');
		const deactivated = share.deactivate();

		expect(updated.createdAt).toEqual(share.createdAt);
		expect(deactivated.createdAt).toEqual(share.createdAt);
	});
});
