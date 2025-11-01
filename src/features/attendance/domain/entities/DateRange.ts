// Date range value object
export class DateRange {
	public readonly start: Date;
	public readonly end: Date;

	constructor(start: Date | string, end: Date | string) {
		const s = start instanceof Date ? start : new Date(start);
		const e = end instanceof Date ? end : new Date(end);

		if (isNaN(s.getTime()) || isNaN(e.getTime())) {
			throw new Error('Invalid dates for DateRange');
		}

		if (s.getTime() > e.getTime()) {
			throw new Error('DateRange start must be before or equal to end');
		}

		this.start = new Date(DateRange.stripTime(s));
		this.end = new Date(DateRange.stripTime(e));
	}

	static stripTime(d: Date): number {
		// Use UTC to avoid timezone issues
		return new Date(
			Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
		).getTime();
	}

	contains(date: Date | string): boolean {
		const t = date instanceof Date ? date : new Date(date);
		const v = DateRange.stripTime(t);
		return v >= this.start.getTime() && v <= this.end.getTime();
	}

	overlaps(other: DateRange): boolean {
		return this.start <= other.end && this.end >= other.start;
	}

	toString(): string {
		return `${this.start.toISOString().slice(0, 10)}..${this.end
			.toISOString()
			.slice(0, 10)}`;
	}
}
