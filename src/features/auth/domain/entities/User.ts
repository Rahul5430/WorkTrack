import { BaseEntity } from '@/shared/domain/entities';
import { Email } from '@/shared/domain/value-objects';
import type { SerializableObject } from '@/shared/types/serialization';

/**
 * User domain entity representing an authenticated user
 */
export class User extends BaseEntity<{
	email: Email;
	name: string;
	photoUrl?: string;
}> {
	public readonly email: Email;
	public readonly name: string;
	public readonly photoUrl?: string;

	constructor(
		id: string,
		email: Email | string,
		name: string,
		photoUrl?: string,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);

		this.email = typeof email === 'string' ? new Email(email) : email;
		this.name = name;
		this.photoUrl = photoUrl;
		this.validate();
	}

	/**
	 * Create a user from a plain object
	 */
	static fromPlainObject(data: {
		id: string;
		email: string;
		name: string;
		photoUrl?: string;
		createdAt?: Date;
		updatedAt?: Date;
	}): User {
		return new User(
			data.id,
			data.email,
			data.name,
			data.photoUrl,
			data.createdAt,
			data.updatedAt
		);
	}

	/**
	 * Update the user with new information
	 */
	update(updates: { name?: string; photoUrl?: string }): User {
		const nextUpdatedAt = new Date(
			Math.max(Date.now(), this.updatedAt.getTime() + 1)
		);
		return new User(
			this.id,
			this.email,
			updates.name ?? this.name,
			updates.photoUrl ?? this.photoUrl,
			this.createdAt,
			nextUpdatedAt
		);
	}

	/**
	 * Check if the user has a photo
	 */
	hasPhoto(): boolean {
		return this.photoUrl !== undefined && this.photoUrl.length > 0;
	}

	/**
	 * Get the display name (name or email)
	 */
	getDisplayName(): string {
		return this.name || this.email.value;
	}

	/**
	 * Validate the user entity
	 */
	protected validate(): void {
		super.validate();

		if (this.name.length > 0 && this.name.trim().length === 0) {
			throw new Error('User name is required');
		}

		if (this.name.length > 100) {
			throw new Error('User name must be 100 characters or less');
		}
	}

	/**
	 * Convert to JSON
	 */
	toJSON(): SerializableObject {
		return {
			...super.toJSON(),
			email: this.email.value,
			name: this.name,
			photoUrl: this.photoUrl,
		};
	}
}
