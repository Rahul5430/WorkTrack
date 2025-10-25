import { BaseEntity } from '../../../../src/shared/domain/entities/BaseEntity';

// Test entity class that extends BaseEntity
class TestEntity extends BaseEntity<{ name: string; age: number }> {
	constructor(
		id: string,
		public name: string,
		public age: number,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
	}

	protected validate(): void {
		super.validate();

		if (!this.name || this.name.trim().length === 0) {
			throw new Error('Name is required');
		}

		if (this.age < 0 || this.age > 150) {
			throw new Error('Age must be between 0 and 150');
		}
	}

	toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			name: this.name,
			age: this.age,
		};
	}
}

describe('BaseEntity', () => {
	describe('constructor', () => {
		it('should create an entity with valid ID', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);

			expect(entity.id).toBe('test-id');
			expect(entity.name).toBe('John Doe');
			expect(entity.age).toBe(30);
			expect(entity.createdAt).toBeInstanceOf(Date);
			expect(entity.updatedAt).toBeInstanceOf(Date);
		});

		it('should create an entity with custom timestamps', () => {
			const createdAt = new Date('2023-01-01');
			const updatedAt = new Date('2023-01-02');
			const entity = new TestEntity(
				'test-id',
				'John Doe',
				30,
				createdAt,
				updatedAt
			);

			expect(entity.createdAt).toEqual(createdAt);
			expect(entity.updatedAt).toEqual(updatedAt);
		});

		it('should throw error for empty ID', () => {
			expect(() => new TestEntity('', 'John Doe', 30)).toThrow(
				'Entity ID must be a non-empty string'
			);
		});

		it('should throw error for whitespace-only ID', () => {
			expect(() => new TestEntity('   ', 'John Doe', 30)).toThrow(
				'Entity ID must be a non-empty string'
			);
		});

		it('should trim whitespace from ID', () => {
			const entity = new TestEntity('  test-id  ', 'John Doe', 30);
			expect(entity.id).toBe('test-id');
		});
	});

	describe('validation', () => {
		it('should validate entity successfully', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			expect(entity.isValid()).toBe(true);
		});

		it('should fail validation for invalid name', () => {
			const entity = new TestEntity('test-id', '', 30);
			expect(entity.isValid()).toBe(false);
		});

		it('should fail validation for invalid age', () => {
			const entity = new TestEntity('test-id', 'John Doe', -1);
			expect(entity.isValid()).toBe(false);
		});

		it('should throw error when validating invalid entity', () => {
			const entity = new TestEntity('test-id', '', 30);
			expect(() => entity.validate()).toThrow('Name is required');
		});
	});

	describe('equality', () => {
		it('should be equal to itself', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			expect(entity.equals(entity)).toBe(true);
		});

		it('should be equal to another entity with same ID and type', () => {
			const entity1 = new TestEntity('test-id', 'John Doe', 30);
			const entity2 = new TestEntity('test-id', 'Jane Doe', 25);
			expect(entity1.equals(entity2)).toBe(true);
		});

		it('should not be equal to entity with different ID', () => {
			const entity1 = new TestEntity('test-id-1', 'John Doe', 30);
			const entity2 = new TestEntity('test-id-2', 'John Doe', 30);
			expect(entity1.equals(entity2)).toBe(false);
		});

		it('should not be equal to null or undefined', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			expect(entity.equals(null)).toBe(false);
			expect(entity.equals(undefined)).toBe(false);
		});

		it('should not be equal to different entity type', () => {
			class DifferentEntity extends BaseEntity<Record<string, never>> {
				constructor(id: string) {
					super(id);
				}
			}

			const entity1 = new TestEntity('test-id', 'John Doe', 30);
			const entity2 = new DifferentEntity('test-id');
			expect(entity1.equals(entity2)).toBe(false);
		});
	});

	describe('hashCode', () => {
		it('should return consistent hash code', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			const hash1 = entity.hashCode();
			const hash2 = entity.hashCode();
			expect(hash1).toBe(hash2);
		});

		it('should return different hash codes for different entities', () => {
			const entity1 = new TestEntity('test-id-1', 'John Doe', 30);
			const entity2 = new TestEntity('test-id-2', 'John Doe', 30);
			expect(entity1.hashCode()).not.toBe(entity2.hashCode());
		});

		it('should include entity type in hash code', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			expect(entity.hashCode()).toContain('TestEntity');
			expect(entity.hashCode()).toContain('test-id');
		});
	});

	describe('serialization', () => {
		it('should serialize to JSON correctly', () => {
			const createdAt = new Date('2023-01-01T00:00:00Z');
			const updatedAt = new Date('2023-01-02T00:00:00Z');
			const entity = new TestEntity(
				'test-id',
				'John Doe',
				30,
				createdAt,
				updatedAt
			);

			const json = entity.toJSON();

			expect(json).toEqual({
				id: 'test-id',
				createdAt: '2023-01-01T00:00:00.000Z',
				updatedAt: '2023-01-02T00:00:00.000Z',
				name: 'John Doe',
				age: 30,
			});
		});

		it('should include base properties in JSON', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			const json = entity.toJSON();

			expect(json).toHaveProperty('id');
			expect(json).toHaveProperty('createdAt');
			expect(json).toHaveProperty('updatedAt');
			expect(json).toHaveProperty('name');
			expect(json).toHaveProperty('age');
		});
	});

	describe('toString', () => {
		it('should return string representation', () => {
			const entity = new TestEntity('test-id', 'John Doe', 30);
			const str = entity.toString();

			expect(str).toContain('TestEntity');
			expect(str).toContain('test-id');
		});
	});

	describe('createUpdatedCopy', () => {
		it('should create updated copy with new timestamp', () => {
			const original = new TestEntity('test-id', 'John Doe', 30);
			const updated = original.createUpdatedCopy({ name: 'Jane Doe' });

			expect(updated.id).toBe(original.id);
			expect(updated.createdAt).toEqual(original.createdAt);
			// The updatedAt should be different (newer) than the original
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
				original.updatedAt.getTime()
			);
		});
	});
});
