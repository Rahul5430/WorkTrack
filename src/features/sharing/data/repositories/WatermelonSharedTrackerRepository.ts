import { Database, Q } from '@nozbe/watermelondb';

import { Share } from '../../domain/entities/Share';
import { IShareRepository } from '../../domain/ports/IShareRepository';
import { ShareMapper, type ShareModelShape } from '../mappers/ShareMapper';
import ShareModel from '../models/ShareModel';

/**
 * Helper function to safely cast WatermelonDB Model to ShareModelShape
 * This is necessary because WatermelonDB's Model type doesn't expose all properties
 * directly, but they are available at runtime.
 */
function toModelShape(model: ShareModel): ShareModelShape {
	return model as unknown as ShareModelShape;
}

export class WatermelonSharedTrackerRepository implements IShareRepository {
	constructor(private readonly database: Database) {}

	async shareTracker(share: Share): Promise<Share> {
		const collection = this.database.get<ShareModel>('shares');
		const data = ShareMapper.toModel(share);
		const created = await collection.create((model) => {
			const record = toModelShape(model);
			record.trackerId = data.trackerId;
			record.sharedWithUserId = data.sharedWithUserId;
			record.permission = data.permission;
			record.isActive = data.isActive;
			record.createdAt = new Date(data.createdAt);
			record.updatedAt = new Date(data.updatedAt);
		});
		return ShareMapper.toDomain(toModelShape(created));
	}

	async updatePermission(
		shareId: string,
		permission: Share['permission'],
		_trackerId?: string
	): Promise<Share> {
		// trackerId is optional and not needed for local DB lookup by ID
		const collection = this.database.get<ShareModel>('shares');
		const found = await collection.find(shareId);
		await found.update((model) => {
			const record = toModelShape(model);
			record.permission = permission.value;
			record.updatedAt = new Date();
		});
		return ShareMapper.toDomain(toModelShape(found));
	}

	async unshare(shareId: string, _trackerId?: string): Promise<void> {
		// trackerId is optional and not needed for local DB lookup by ID
		const collection = this.database.get<ShareModel>('shares');
		const found = await collection.find(shareId);
		await found.update((model) => {
			const record = toModelShape(model);
			record.isActive = false;
			record.updatedAt = new Date();
		});
	}

	async getMyShares(ownerUserId: string): Promise<Share[]> {
		const collection = this.database.get<ShareModel>('shares');
		const models = await collection
			.query(
				Q.where('created_by_user_id', ownerUserId),
				Q.where('is_active', true)
			)
			.fetch();
		return models.map((m) => ShareMapper.toDomain(toModelShape(m)));
	}

	async getSharedWithMe(userId: string): Promise<Share[]> {
		const collection = this.database.get<ShareModel>('shares');
		const models = await collection
			.query(
				Q.where('shared_with_user_id', userId),
				Q.where('is_active', true)
			)
			.fetch();
		return models.map((m) => ShareMapper.toDomain(toModelShape(m)));
	}
}
