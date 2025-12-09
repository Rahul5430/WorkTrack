/**
 * UUID value object with validation and utility methods
 */
export class UUID {
	private readonly _value: string;

	constructor(value: string) {
		this._value = this.validate(value);
	}

	/**
	 * Get the UUID value
	 */
	get value(): string {
		return this._value;
	}

	/**
	 * Validate the UUID format
	 */
	private validate(value: string): string {
		if (!value || typeof value !== 'string') {
			throw new Error('UUID must be a non-empty string');
		}

		const trimmed = value.trim();

		if (trimmed.length === 0) {
			throw new Error('UUID must be a non-empty string');
		}

		// Basic UUID format validation (supports both v4 and custom formats)
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(trimmed)) {
			throw new Error('Invalid UUID format');
		}

		return trimmed.toLowerCase();
	}

	/**
	 * Generate a new UUID v4
	 */
	static generate(): UUID {
		// Simple UUID v4 generation (for demo purposes)
		// In production, use a proper UUID library like 'uuid'
		const chars = '0123456789abcdef';
		let result = '';

		for (let i = 0; i < 32; i++) {
			if (i === 8 || i === 12 || i === 16 || i === 20) {
				result += '-';
			}
			result += chars[Math.floor(Math.random() * 16)];
		}

		// Set version (4) and variant bits
		const charsArray = result.split('');
		charsArray[12] = '4';
		// eslint-disable-next-line no-bitwise
		charsArray[16] = chars[(parseInt(charsArray[16], 16) & 0x3) | 0x8];

		return new UUID(charsArray.join(''));
	}

	/**
	 * Create a UUID from a string (with validation)
	 */
	static fromString(value: string): UUID {
		return new UUID(value);
	}

	/**
	 * Check if a string is a valid UUID
	 */
	static isValid(value: string): boolean {
		try {
			// eslint-disable-next-line no-new
			new UUID(value);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if this UUID equals another UUID
	 */
	equals(other: UUID | null | undefined): boolean {
		if (other === null || other === undefined) {
			return false;
		}

		if (this === other) {
			return true;
		}

		return this._value === other._value;
	}

	/**
	 * Get a hash code for this UUID
	 */
	hashCode(): string {
		return this._value;
	}

	/**
	 * Convert to string
	 */
	toString(): string {
		return this._value;
	}

	/**
	 * Convert to JSON
	 */
	toJSON(): string {
		return this._value;
	}

	/**
	 * Get the short form (first 8 characters)
	 */
	short(): string {
		return this._value.substring(0, 8);
	}

	/**
	 * Check if this is a nil UUID (all zeros)
	 */
	isNil(): boolean {
		return this._value === '00000000-0000-0000-0000-000000000000';
	}
}
