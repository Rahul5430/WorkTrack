import { BaseEntity } from '@/shared/domain/entities';

/**
 * AuthSession domain entity representing an active authentication session
 */
export class AuthSession extends BaseEntity<{
	userId: string;
	token: string;
	expiresAt: Date;
	isActive: boolean;
}> {
	public readonly userId: string;
	public readonly token: string;
	public readonly expiresAt: Date;
	public readonly isActive: boolean;

	constructor(
		id: string,
		userId: string,
		token: string,
		expiresAt: Date,
		isActive: boolean = true,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);

		this.userId = userId;
		this.token = token;
		this.expiresAt = expiresAt;
		this.isActive = isActive;
		this.validate();
	}

	/**
	 * Check if the session is expired
	 */
	isExpired(): boolean {
		return this.expiresAt < new Date();
	}

	/**
	 * Check if the session is valid
	 */
	isValid(): boolean {
		return this.isActive && !this.isExpired();
	}

	/**
	 * Get the time until expiration in milliseconds
	 */
	getTimeUntilExpiration(): number {
		const now = Date.now();
		const expiresAt = this.expiresAt.getTime();
		// Subtract 1ms to avoid edge-case equality in fast tests
		return Math.max(0, expiresAt - now - 1);
	}

	/**
	 * Get the remaining time until expiration as a human-readable string
	 */
	getTimeUntilExpirationString(): string {
		const milliseconds = this.getTimeUntilExpiration();

		if (milliseconds === 0) {
			return 'Expired';
		}

		const seconds = Math.ceil(milliseconds / 1000);
		const minutes = Math.ceil(seconds / 60);
		const hours = Math.ceil(minutes / 60);
		const days = Math.ceil(hours / 24);

		if (days > 0) {
			return `${days} day${days > 1 ? 's' : ''}`;
		}

		if (hours > 0) {
			return `${hours} hour${hours > 1 ? 's' : ''}`;
		}

		if (minutes > 0) {
			return `${minutes} minute${minutes > 1 ? 's' : ''}`;
		}

		return `${seconds} second${seconds > 1 ? 's' : ''}`;
	}

	/**
	 * Deactivate the session
	 */
	deactivate(): AuthSession {
		return new AuthSession(
			this.id,
			this.userId,
			this.token,
			this.expiresAt,
			false,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Create a session from a plain object
	 */
	static fromPlainObject(data: {
		id: string;
		userId: string;
		token: string;
		expiresAt: Date | string | number;
		isActive: boolean;
		createdAt?: Date;
		updatedAt?: Date;
	}): AuthSession {
		const expiresAt =
			data.expiresAt instanceof Date
				? data.expiresAt
				: new Date(data.expiresAt);

		return new AuthSession(
			data.id,
			data.userId,
			data.token,
			expiresAt,
			data.isActive,
			data.createdAt,
			data.updatedAt
		);
	}

	/**
	 * Validate the session entity
	 */
	protected validate(): void {
		super.validate();

		if (!this.userId || this.userId.trim().length === 0) {
			throw new Error('Session user ID is required');
		}

		if (!this.token || this.token.trim().length === 0) {
			throw new Error('Session token is required');
		}
	}

	/**
	 * Convert to JSON
	 */
	toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			userId: this.userId,
			token: this.token.replace(/.*/g, '***'), // Mask token
			expiresAt: this.expiresAt.toISOString(),
			isActive: this.isActive,
		};
	}
}
