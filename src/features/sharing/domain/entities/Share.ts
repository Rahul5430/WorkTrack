import { BaseEntity } from '@/shared/domain/entities';

import { Permission, type PermissionType } from './Permission';

export class Share extends BaseEntity<{
	trackerId: string;
	sharedWithUserId: string;
	permission: Permission;
	isActive: boolean;
}> {
	public readonly trackerId: string;
	public readonly sharedWithUserId: string;
	public readonly permission: Permission;
	public readonly isActive: boolean;

	constructor(
		id: string,
		trackerId: string,
		sharedWithUserId: string,
		permission: PermissionType | Permission,
		isActive = true,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
		this.trackerId = trackerId;
		this.sharedWithUserId = sharedWithUserId;
		this.permission =
			permission instanceof Permission
				? permission
				: new Permission(permission);
		this.isActive = isActive;
		this.validate();
	}

	withPermission(permission: PermissionType): Share {
		return new Share(
			this.id,
			this.trackerId,
			this.sharedWithUserId,
			permission,
			this.isActive,
			this.createdAt,
			new Date()
		);
	}

	deactivate(): Share {
		return new Share(
			this.id,
			this.trackerId,
			this.sharedWithUserId,
			this.permission,
			false,
			this.createdAt,
			new Date()
		);
	}

	protected validate(): void {
		super.validate();
		if (!this.trackerId || this.trackerId.trim().length === 0) {
			throw new Error('trackerId is required');
		}
		if (
			!this.sharedWithUserId ||
			this.sharedWithUserId.trim().length === 0
		) {
			throw new Error('sharedWithUserId is required');
		}
	}
}
