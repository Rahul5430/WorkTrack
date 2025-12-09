import type { SerializableObject } from '@/shared/types/serialization';

/**
 * Base entity class that provides common functionality for all domain entities
 * Implements validation, equality, and serialization helpers
 */
export abstract class BaseEntity<T> {
	protected readonly _id: string;
	protected readonly _createdAt: Date;
	protected readonly _updatedAt: Date;

	constructor(id: string, createdAt?: Date, updatedAt?: Date) {
		this._id = this.validateId(id);
		this._createdAt = createdAt || new Date();
		this._updatedAt = updatedAt || new Date();
	}

	/**
	 * Get the entity's unique identifier
	 */
	get id(): string {
		return this._id;
	}

	/**
	 * Get the creation timestamp
	 */
	get createdAt(): Date {
		return this._createdAt;
	}

	/**
	 * Get the last update timestamp
	 */
	get updatedAt(): Date {
		return this._updatedAt;
	}

	/**
	 * Validate the entity's ID
	 */
	protected validateId(id: string): string {
		if (!id || typeof id !== 'string' || id.trim().length === 0) {
			throw new Error('Entity ID must be a non-empty string');
		}
		return id.trim();
	}

	/**
	 * Check if this entity is equal to another entity
	 * Two entities are equal if they have the same ID and type
	 */
	equals(other: BaseEntity<T> | null | undefined): boolean {
		if (other === null || other === undefined) {
			return false;
		}

		if (this === other) {
			return true;
		}

		if (this.constructor !== other.constructor) {
			return false;
		}

		return this._id === other._id;
	}

	/**
	 * Get a hash code for this entity based on its ID and type
	 */
	hashCode(): string {
		return `${this.constructor.name}:${this._id}`;
	}

	/**
	 * Convert the entity to a plain object for serialization
	 * Subclasses should override this method to include their specific properties
	 */
	toJSON(): SerializableObject {
		return {
			id: this._id,
			createdAt: this._createdAt.toISOString(),
			updatedAt: this._updatedAt.toISOString(),
		};
	}

	/**
	 * Create a copy of this entity with updated timestamps
	 * Useful for creating updated versions of entities
	 */
	public createUpdatedCopy(_updates: Partial<T>): this {
		const clone: this = Object.create(this);
		Object.defineProperty(clone, '_updatedAt', {
			value: new Date(),
			writable: false,
			configurable: true,
			enumerable: false,
		});
		return clone;
	}

	/**
	 * Validate the entity's state
	 * Subclasses should override this method to implement their specific validation rules
	 */
	protected validate(): void {
		// Base validation - can be overridden by subclasses
		if (!this._id || this._id.trim().length === 0) {
			throw new Error('Entity ID is required');
		}
	}

	/**
	 * Check if the entity is valid
	 */
	isValid(): boolean {
		try {
			this.validate();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get a string representation of the entity
	 */
	toString(): string {
		return `${this.constructor.name}(id=${this._id})`;
	}
}
