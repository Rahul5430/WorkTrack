import { BaseEntity } from '@/shared/domain/entities';

// Tracker entity
export class Tracker extends BaseEntity<{
	name: string;
	description?: string;
	isActive: boolean;
}> {
	public readonly name: string;
	public readonly description?: string;
	public readonly isActive: boolean;

	constructor(
		id: string,
		name: string,
		description?: string,
		isActive: boolean = true,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
		this.name = name;
		this.description = description;
		this.isActive = isActive;
		this.validate();
	}

	activate(): Tracker {
		return new Tracker(
			this.id,
			this.name,
			this.description,
			true,
			this.createdAt,
			new Date()
		);
	}

	deactivate(): Tracker {
		return new Tracker(
			this.id,
			this.name,
			this.description,
			false,
			this.createdAt,
			new Date()
		);
	}

	protected validate(): void {
		super.validate();
		if (!this.name || this.name.trim().length === 0) {
			throw new Error('Tracker name is required');
		}
		if (this.name.length > 100) {
			throw new Error('Tracker name must be <= 100 chars');
		}
	}
}
