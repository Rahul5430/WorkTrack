import { UUID } from '../../../../../src/shared/domain/value-objects/UUID';

describe('UUID', () => {
	describe('constructor', () => {
		it('should create UUID with valid string', () => {
			const uuidString = '550e8400-e29b-41d4-a716-446655440000';
			const uuid = new UUID(uuidString);

			expect(uuid.value).toBe('550e8400-e29b-41d4-a716-446655440000');
		});

		it('should normalize UUID to lowercase', () => {
			const uuidString = '550E8400-E29B-41D4-A716-446655440000';
			const uuid = new UUID(uuidString);

			expect(uuid.value).toBe('550e8400-e29b-41d4-a716-446655440000');
		});

		it('should trim whitespace', () => {
			const uuidString = '  550e8400-e29b-41d4-a716-446655440000  ';
			const uuid = new UUID(uuidString);

			expect(uuid.value).toBe('550e8400-e29b-41d4-a716-446655440000');
		});

		it('should throw error for empty string', () => {
			expect(() => new UUID('')).toThrow(
				'UUID must be a non-empty string'
			);
		});

		it('should throw error for whitespace-only string', () => {
			expect(() => new UUID('   ')).toThrow(
				'UUID must be a non-empty string'
			);
		});

		it('should throw error for invalid format', () => {
			expect(() => new UUID('invalid-uuid')).toThrow(
				'Invalid UUID format'
			);
			expect(() => new UUID('550e8400-e29b-41d4-a716')).toThrow(
				'Invalid UUID format'
			);
			expect(
				() => new UUID('550e8400-e29b-41d4-a716-446655440000-extra')
			).toThrow('Invalid UUID format');
		});

		it('should throw error for non-string input', () => {
			expect(() => new UUID(null as unknown as string)).toThrow(
				'UUID must be a non-empty string'
			);
			expect(() => new UUID(undefined as unknown as string)).toThrow(
				'UUID must be a non-empty string'
			);
			expect(() => new UUID(123 as unknown as string)).toThrow(
				'UUID must be a non-empty string'
			);
		});
	});

	describe('static methods', () => {
		describe('generate', () => {
			it('should generate a valid UUID', () => {
				const uuid = UUID.generate();

				expect(uuid).toBeInstanceOf(UUID);
				expect(UUID.isValid(uuid.value)).toBe(true);
			});

			it('should generate different UUIDs', () => {
				const uuid1 = UUID.generate();
				const uuid2 = UUID.generate();

				expect(uuid1.value).not.toBe(uuid2.value);
			});

			it('should generate UUIDs with correct format', () => {
				const uuid = UUID.generate();
				const uuidRegex =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

				expect(uuidRegex.test(uuid.value)).toBe(true);
			});
		});

		describe('fromString', () => {
			it('should create UUID from valid string', () => {
				const uuidString = '550e8400-e29b-41d4-a716-446655440000';
				const uuid = UUID.fromString(uuidString);

				expect(uuid.value).toBe('550e8400-e29b-41d4-a716-446655440000');
			});

			it('should throw error for invalid string', () => {
				expect(() => UUID.fromString('invalid')).toThrow(
					'Invalid UUID format'
				);
			});
		});

		describe('isValid', () => {
			it('should return true for valid UUID', () => {
				expect(
					UUID.isValid('550e8400-e29b-41d4-a716-446655440000')
				).toBe(true);
				expect(
					UUID.isValid('550E8400-E29B-41D4-A716-446655440000')
				).toBe(true);
			});

			it('should return false for invalid UUID', () => {
				expect(UUID.isValid('invalid-uuid')).toBe(false);
				expect(UUID.isValid('550e8400-e29b-41d4-a716')).toBe(false);
				expect(UUID.isValid('')).toBe(false);
				expect(UUID.isValid('   ')).toBe(false);
			});
		});
	});

	describe('equality', () => {
		it('should be equal to itself', () => {
			const uuid = new UUID('550e8400-e29b-41d4-a716-446655440000');
			expect(uuid.equals(uuid)).toBe(true);
		});

		it('should be equal to UUID with same value', () => {
			const uuid1 = new UUID('550e8400-e29b-41d4-a716-446655440000');
			const uuid2 = new UUID('550e8400-e29b-41d4-a716-446655440000');

			expect(uuid1.equals(uuid2)).toBe(true);
		});

		it('should be equal to UUID with same value (case insensitive)', () => {
			const uuid1 = new UUID('550e8400-e29b-41d4-a716-446655440000');
			const uuid2 = new UUID('550E8400-E29B-41D4-A716-446655440000');

			expect(uuid1.equals(uuid2)).toBe(true);
		});

		it('should not be equal to UUID with different value', () => {
			const uuid1 = new UUID('550e8400-e29b-41d4-a716-446655440000');
			const uuid2 = new UUID('550e8400-e29b-41d4-a716-446655440001');

			expect(uuid1.equals(uuid2)).toBe(false);
		});

		it('should not be equal to null or undefined', () => {
			const uuid = new UUID('550e8400-e29b-41d4-a716-446655440000');

			expect(uuid.equals(null)).toBe(false);
			expect(uuid.equals(undefined)).toBe(false);
		});
	});

	describe('utility methods', () => {
		it('should return hash code', () => {
			const uuid = new UUID('550e8400-e29b-41d4-a716-446655440000');

			expect(uuid.hashCode()).toBe(
				'550e8400-e29b-41d4-a716-446655440000'
			);
		});

		it('should convert to string', () => {
			const uuidString = '550e8400-e29b-41d4-a716-446655440000';
			const uuid = new UUID(uuidString);

			expect(uuid.toString()).toBe(
				'550e8400-e29b-41d4-a716-446655440000'
			);
		});

		it('should convert to JSON', () => {
			const uuidString = '550e8400-e29b-41d4-a716-446655440000';
			const uuid = new UUID(uuidString);

			expect(uuid.toJSON()).toBe('550e8400-e29b-41d4-a716-446655440000');
		});

		it('should return short form', () => {
			const uuid = new UUID('550e8400-e29b-41d4-a716-446655440000');

			expect(uuid.short()).toBe('550e8400');
		});

		it('should check if nil', () => {
			const nilUuid = new UUID('00000000-0000-0000-0000-000000000000');
			const regularUuid = new UUID(
				'550e8400-e29b-41d4-a716-446655440000'
			);

			expect(nilUuid.isNil()).toBe(true);
			expect(regularUuid.isNil()).toBe(false);
		});
	});
});
