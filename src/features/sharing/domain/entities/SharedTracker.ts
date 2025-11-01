import { BaseEntity } from '@/shared/domain/entities';

export class SharedTracker extends BaseEntity<{
	trackerId: string;
	ownerUserId: string;
	name: string;
}> {
	public readonly trackerId: string;
	public readonly ownerUserId: string;
	public readonly name: string;

	constructor(
		id: string,
		trackerId: string,
		ownerUserId: string,
		name: string,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
		this.trackerId = trackerId;
		this.ownerUserId = ownerUserId;
		this.name = name;
		this.validate();
	}

	protected validate(): void {
		super.validate();
		if (!this.trackerId || this.trackerId.trim().length === 0) {
			throw new Error('trackerId is required');
		}
		if (!this.ownerUserId || this.ownerUserId.trim().length === 0) {
			throw new Error('ownerUserId is required');
		}
		if (!this.name || this.name.trim().length === 0) {
			throw new Error('name is required');
		}
	}
}
