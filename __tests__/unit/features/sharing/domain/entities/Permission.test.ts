import { Permission } from '@/features/sharing/domain/entities/Permission';

describe('Permission', () => {
	describe('constructor', () => {
		it('creates permission with read value', () => {
			const permission = new Permission('read');

			expect(permission.value).toBe('read');
		});

		it('creates permission with write value', () => {
			const permission = new Permission('write');

			expect(permission.value).toBe('write');
		});

		it('throws error for invalid permission value', () => {
			expect(() => {
				// @ts-expect-error invalid permission type
				// eslint-disable-next-line no-new
				new Permission('invalid');
			}).toThrow('Invalid permission');
		});
	});

	describe('isWrite', () => {
		it('returns true for write permission', () => {
			const permission = new Permission('write');

			expect(permission.isWrite()).toBe(true);
		});

		it('returns false for read permission', () => {
			const permission = new Permission('read');

			expect(permission.isWrite()).toBe(false);
		});
	});

	describe('toString', () => {
		it('returns read for read permission', () => {
			const permission = new Permission('read');

			expect(permission.toString()).toBe('read');
		});

		it('returns write for write permission', () => {
			const permission = new Permission('write');

			expect(permission.toString()).toBe('write');
		});
	});
});
