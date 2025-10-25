/**
 * Timestamp value object with validation and utility methods
 */
export class Timestamp {
	private readonly _value: Date;

	constructor(value: Date | string | number) {
		this._value = this.validate(value);
	}

	/**
	 * Get the timestamp value as a Date
	 */
	get value(): Date {
		return this._value;
	}

	/**
	 * Get the timestamp as milliseconds since epoch
	 */
	get milliseconds(): number {
		return this._value.getTime();
	}

	/**
	 * Get the timestamp as seconds since epoch
	 */
	get seconds(): number {
		return Math.floor(this._value.getTime() / 1000);
	}

	/**
	 * Validate the timestamp value
	 */
	private validate(value: Date | string | number): Date {
		let date: Date;

		if (value instanceof Date) {
			date = value;
		} else if (typeof value === 'string') {
			date = new Date(value);
		} else if (typeof value === 'number') {
			date = new Date(value);
		} else {
			throw new Error('Timestamp must be a Date, string, or number');
		}

		if (isNaN(date.getTime())) {
			throw new Error('Invalid timestamp value');
		}

		return date;
	}

	/**
	 * Create a timestamp from a Date
	 */
	static fromDate(date: Date): Timestamp {
		return new Timestamp(date);
	}

	/**
	 * Create a timestamp from a string
	 */
	static fromString(value: string): Timestamp {
		return new Timestamp(value);
	}

	/**
	 * Create a timestamp from milliseconds
	 */
	static fromMilliseconds(milliseconds: number): Timestamp {
		return new Timestamp(milliseconds);
	}

	/**
	 * Create a timestamp from seconds
	 */
	static fromSeconds(seconds: number): Timestamp {
		return new Timestamp(seconds * 1000);
	}

	/**
	 * Create a timestamp for the current time
	 */
	static now(): Timestamp {
		return new Timestamp(new Date());
	}

	/**
	 * Create a timestamp for a specific date
	 */
	static fromDateParts(
		year: number,
		month: number,
		day: number,
		hour: number = 0,
		minute: number = 0,
		second: number = 0,
		millisecond: number = 0
	): Timestamp {
		const date = new Date(
			year,
			month - 1,
			day,
			hour,
			minute,
			second,
			millisecond
		);
		return new Timestamp(date);
	}

	/**
	 * Check if a value is a valid timestamp
	 */
	static isValid(value: Date | string | number): boolean {
		try {
			// eslint-disable-next-line no-new
			new Timestamp(value);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if this timestamp equals another timestamp
	 */
	equals(other: Timestamp | null | undefined): boolean {
		if (other === null || other === undefined) {
			return false;
		}

		if (this === other) {
			return true;
		}

		return this._value.getTime() === other._value.getTime();
	}

	/**
	 * Check if this timestamp is before another timestamp
	 */
	isBefore(other: Timestamp): boolean {
		return this._value.getTime() < other._value.getTime();
	}

	/**
	 * Check if this timestamp is after another timestamp
	 */
	isAfter(other: Timestamp): boolean {
		return this._value.getTime() > other._value.getTime();
	}

	/**
	 * Check if this timestamp is the same as another timestamp
	 */
	isSame(other: Timestamp): boolean {
		return this._value.getTime() === other._value.getTime();
	}

	/**
	 * Get the difference in milliseconds between this timestamp and another
	 */
	differenceInMilliseconds(other: Timestamp): number {
		return this._value.getTime() - other._value.getTime();
	}

	/**
	 * Get the difference in seconds between this timestamp and another
	 */
	differenceInSeconds(other: Timestamp): number {
		return Math.floor(this.differenceInMilliseconds(other) / 1000);
	}

	/**
	 * Get the difference in minutes between this timestamp and another
	 */
	differenceInMinutes(other: Timestamp): number {
		return Math.floor(this.differenceInSeconds(other) / 60);
	}

	/**
	 * Get the difference in hours between this timestamp and another
	 */
	differenceInHours(other: Timestamp): number {
		return Math.floor(this.differenceInMinutes(other) / 60);
	}

	/**
	 * Get the difference in days between this timestamp and another
	 */
	differenceInDays(other: Timestamp): number {
		return Math.floor(this.differenceInHours(other) / 24);
	}

	/**
	 * Add milliseconds to this timestamp
	 */
	addMilliseconds(milliseconds: number): Timestamp {
		const newDate = new Date(this._value.getTime() + milliseconds);
		return new Timestamp(newDate);
	}

	/**
	 * Add seconds to this timestamp
	 */
	addSeconds(seconds: number): Timestamp {
		return this.addMilliseconds(seconds * 1000);
	}

	/**
	 * Add minutes to this timestamp
	 */
	addMinutes(minutes: number): Timestamp {
		return this.addSeconds(minutes * 60);
	}

	/**
	 * Add hours to this timestamp
	 */
	addHours(hours: number): Timestamp {
		return this.addMinutes(hours * 60);
	}

	/**
	 * Add days to this timestamp
	 */
	addDays(days: number): Timestamp {
		return this.addHours(days * 24);
	}

	/**
	 * Get a hash code for this timestamp
	 */
	hashCode(): string {
		return this._value.getTime().toString();
	}

	/**
	 * Convert to string (ISO format)
	 */
	toString(): string {
		return this._value.toISOString();
	}

	/**
	 * Convert to JSON (ISO format)
	 */
	toJSON(): string {
		return this._value.toISOString();
	}

	/**
	 * Convert to a formatted string
	 */
	format(format: 'iso' | 'date' | 'time' | 'datetime' = 'iso'): string {
		switch (format) {
			case 'iso':
				return this._value.toISOString();
			case 'date':
				return this._value.toLocaleDateString();
			case 'time':
				return this._value.toLocaleTimeString();
			case 'datetime':
				return this._value.toLocaleString();
			default:
				return this._value.toISOString();
		}
	}

	/**
	 * Check if this timestamp is in the past
	 */
	isPast(): boolean {
		return this.isBefore(Timestamp.now());
	}

	/**
	 * Check if this timestamp is in the future
	 */
	isFuture(): boolean {
		return this.isAfter(Timestamp.now());
	}

	/**
	 * Check if this timestamp is today
	 */
	isToday(): boolean {
		const now = new Date();
		const today = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);
		const thisDate = new Date(
			this._value.getFullYear(),
			this._value.getMonth(),
			this._value.getDate()
		);
		return today.getTime() === thisDate.getTime();
	}
}
