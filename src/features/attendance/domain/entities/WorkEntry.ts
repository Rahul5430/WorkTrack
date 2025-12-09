// Core work entry entity
import { BaseEntity } from '@/shared/domain/entities';

import { WorkStatus } from './WorkStatus';

export class WorkEntry extends BaseEntity<{
	userId: string;
	trackerId: string;
	date: string; // ISO date (YYYY-MM-DD)
	status: WorkStatus;
	notes?: string;
	isAdvisory: boolean;
}> {
	public readonly userId: string;
	public readonly trackerId: string;
	public readonly date: string; // ISO date yyyy-mm-dd
	public readonly status: WorkStatus;
	public readonly notes?: string;
	public readonly isAdvisory: boolean;

	constructor(
		id: string,
		userId: string,
		trackerId: string,
		date: string,
		status: WorkStatus | string,
		notes?: string,
		isAdvisory: boolean = false,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
		this.userId = userId;
		this.trackerId = trackerId;
		this.date = WorkEntry.normalizeDate(date);
		this.status =
			status instanceof WorkStatus ? status : new WorkStatus(status);
		this.notes = notes;
		this.isAdvisory = isAdvisory;
		this.validate();
	}

	static normalizeDate(d: string): string {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
			const parsed = new Date(d);
			if (isNaN(parsed.getTime())) {
				throw new Error('Invalid date');
			}
			return parsed.toISOString().slice(0, 10);
		}
		return d;
	}

	withUpdates(updates: {
		status?: WorkStatus | string;
		notes?: string;
		isAdvisory?: boolean;
	}): WorkEntry {
		// Ensure updatedAt is always different from createdAt
		const now = new Date();
		const updatedAt =
			now.getTime() > this.createdAt.getTime()
				? now
				: new Date(this.createdAt.getTime() + 1);

		return new WorkEntry(
			this.id,
			this.userId,
			this.trackerId,
			this.date,
			updates.status
				? updates.status instanceof WorkStatus
					? updates.status
					: new WorkStatus(updates.status)
				: this.status,
			updates.notes ?? this.notes,
			updates.isAdvisory ?? this.isAdvisory,
			this.createdAt,
			updatedAt
		);
	}

	protected validate(): void {
		super.validate();
		if (!this.userId) throw new Error('userId is required');
		if (!this.trackerId) throw new Error('trackerId is required');
		if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
			throw new Error('date must be in YYYY-MM-DD format');
		}
	}
}
