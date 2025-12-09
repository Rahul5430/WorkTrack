// Tracker mapper
import { Tracker } from '../../domain/entities/Tracker';

export interface TrackerModelShape {
	id: string;
	name: string;
	description?: string;
	userId: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const TrackerMapper = {
	toDomain(model: TrackerModelShape): Tracker {
		return new Tracker(
			model.id,
			model.name,
			model.description,
			model.isActive,
			model.createdAt,
			model.updatedAt
		);
	},

	toModel(tracker: Tracker): {
		name: string;
		description?: string;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	} {
		return {
			name: tracker.name,
			description: tracker.description,
			isActive: tracker.isActive,
			createdAt: tracker.createdAt.getTime(),
			updatedAt: tracker.updatedAt.getTime(),
		};
	},
};
