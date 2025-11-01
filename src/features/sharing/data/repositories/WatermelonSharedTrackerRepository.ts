import { Database, Q } from '@nozbe/watermelondb';

import { Share } from '../../domain/entities/Share';
import { IShareRepository } from '../../domain/ports/IShareRepository';
import { ShareMapper, type ShareModelShape } from '../mappers/ShareMapper';
import ShareModel from '../models/ShareModel';

export class WatermelonSharedTrackerRepository implements IShareRepository {
	constructor(private readonly database: Database) {}

	async shareTracker(share: Share): Promise<Share> {
		const collection = this.database.get<ShareModel>('shares');
		const data = ShareMapper.toModel(share);
		const created = await collection.create((model) => {
			const record = model as unknown as ShareModelShape;
			record.trackerId = data.trackerId;
			record.sharedWithUserId = data.sharedWithUserId;
			record.permission = data.permission;
			record.isActive = data.isActive;
			record.createdAt = new Date(data.createdAt);
			record.updatedAt = new Date(data.updatedAt);
		});
		return ShareMapper.toDomain(created as unknown as ShareModelShape);
	}

	async updatePermission(
		shareId: string,
		permission: Share['permission']
	): Promise<Share> {
		const collection = this.database.get<ShareModel>('shares');
		const found = await collection.find(shareId);
		await found.update((model) => {
			(model as unknown as ShareModelShape).permission = permission.value;
			(model as unknown as ShareModelShape).updatedAt = new Date();
		});
		return ShareMapper.toDomain(found as unknown as ShareModelShape);
	}

	async unshare(shareId: string): Promise<void> {
		const collection = this.database.get<ShareModel>('shares');
		const found = await collection.find(shareId);
		await found.update((model) => {
			(model as unknown as ShareModelShape).isActive = false;
			(model as unknown as ShareModelShape).updatedAt = new Date();
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
		return models.map((m) =>
			ShareMapper.toDomain(m as unknown as ShareModelShape)
		);
	}

	async getSharedWithMe(userId: string): Promise<Share[]> {
		const collection = this.database.get<ShareModel>('shares');
		const models = await collection
			.query(
				Q.where('shared_with_user_id', userId),
				Q.where('is_active', true)
			)
			.fetch();
		return models.map((m) =>
			ShareMapper.toDomain(m as unknown as ShareModelShape)
		);
	}
}
