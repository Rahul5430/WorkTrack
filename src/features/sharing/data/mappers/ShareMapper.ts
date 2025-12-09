import { Share } from '../../domain/entities/Share';
import ShareModel from '../models/ShareModel';

export interface ShareModelShape {
	id: string;
	trackerId: string;
	sharedWithUserId: string;
	permission: string;
	isActive: boolean;
	createdByUserId: string;
	createdAt: Date;
	updatedAt: Date;
}

export const ShareMapper = {
	toDomain(model: ShareModel | ShareModelShape): Share {
		const m = model as ShareModelShape;
		return new Share(
			m.id,
			m.trackerId,
			m.sharedWithUserId,
			m.permission as 'read' | 'write',
			m.isActive,
			m.createdAt,
			m.updatedAt
		);
	},

	toModel(share: Share): {
		trackerId: string;
		sharedWithUserId: string;
		permission: string;
		isActive: boolean;
		createdByUserId?: string;
		createdAt: number;
		updatedAt: number;
	} {
		return {
			trackerId: share.trackerId,
			sharedWithUserId: share.sharedWithUserId,
			permission: share.permission.value,
			isActive: share.isActive,
			createdAt: share.createdAt.getTime(),
			updatedAt: share.updatedAt.getTime(),
		};
	},
};
