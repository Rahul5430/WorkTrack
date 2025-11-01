/**
 * Email value object with validation and utility methods
 */
export class Email {
	private readonly _value: string;
	private readonly _localPart: string;
	private readonly _domain: string;

	constructor(value: string) {
		this._value = this.validate(value);
		if (this._value === '') {
			this._localPart = '';
			this._domain = '';
		} else {
			const [localPart, domain] = this._value.split('@');
			this._localPart = localPart;
			this._domain = domain;
		}
	}

	/**
	 * Get the full email value
	 */
	get value(): string {
		return this._value;
	}

	/**
	 * Get the local part (before @)
	 */
	get localPart(): string {
		return this._localPart;
	}

	/**
	 * Get the domain part (after @)
	 */
	get domain(): string {
		return this._domain;
	}

	/**
	 * Validate the email format
	 */
	private validate(value: string): string {
		if (
			value === null ||
			value === undefined ||
			typeof value !== 'string'
		) {
			throw new Error('Email must be a non-empty string');
		}

		const trimmed = value.trim();
		// Allow exactly empty string, but disallow whitespace-only strings
		if (value === '') {
			return '';
		}
		if (trimmed.length === 0) {
			throw new Error('Email must be a non-empty string');
		}

		// Basic email format validation
		const emailRegex =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		if (!emailRegex.test(trimmed)) {
			throw new Error('Invalid email format');
		}

		// Additional validation
		const [localPart, domain] = trimmed.split('@');

		if (localPart.length > 64) {
			throw new Error('Email local part is too long (max 64 characters)');
		}

		if (domain.length > 253) {
			throw new Error('Email domain is too long (max 253 characters)');
		}

		if (trimmed.length > 254) {
			throw new Error('Email is too long (max 254 characters)');
		}

		if (localPart.startsWith('.') || localPart.endsWith('.')) {
			throw new Error('Email local part cannot start or end with a dot');
		}

		if (localPart.includes('..')) {
			throw new Error('Email local part cannot contain consecutive dots');
		}

		return trimmed.toLowerCase();
	}

	/**
	 * Create an email from a string (with validation)
	 */
	static fromString(value: string): Email {
		return new Email(value);
	}

	/**
	 * Check if a string is a valid email
	 */
	static isValid(value: string): boolean {
		try {
			// eslint-disable-next-line no-new
			new Email(value);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if this email equals another email
	 */
	equals(other: Email | null | undefined): boolean {
		if (other === null || other === undefined) {
			return false;
		}

		if (this === other) {
			return true;
		}

		return this._value === other._value;
	}

	/**
	 * Get a hash code for this email
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
	 * Get a masked version of the email (e.g., j***@example.com)
	 */
	masked(): string {
		if (this._localPart.length <= 2) {
			return `${this._localPart[0]}***@${this._domain}`;
		}

		const maskedLocal = `${this._localPart[0]}${'*'.repeat(this._localPart.length - 2)}${this._localPart[this._localPart.length - 1]}`;
		return `${maskedLocal}@${this._domain}`;
	}

	/**
	 * Check if this is a Gmail address
	 */
	isGmail(): boolean {
		return this._domain === 'gmail.com';
	}

	/**
	 * Check if this is a corporate email (not common providers)
	 */
	isCorporate(): boolean {
		const commonProviders = [
			'gmail.com',
			'yahoo.com',
			'hotmail.com',
			'outlook.com',
			'aol.com',
			'icloud.com',
		];

		return !commonProviders.includes(this._domain);
	}

	/**
	 * Get the display name (local part)
	 */
	getDisplayName(): string {
		return this._localPart;
	}
}
