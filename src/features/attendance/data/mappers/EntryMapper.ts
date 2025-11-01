// Model ↔ Entity mapper
import { WorkEntry } from '../../domain/entities/WorkEntry';
import { WorkStatus } from '../../domain/entities/WorkStatus';

// Minimal model shape for mapping
export interface WorkEntryModelShape {
	id: string;
	date: string | Date;
	status: string;
	isAdvisory: boolean;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	trackerId: string;
}

export const EntryMapper = {
	toDomain(model: WorkEntryModelShape): WorkEntry {
		const dateIso =
			typeof model.date === 'string'
				? model.date
				: model.date.toISOString();
		return new WorkEntry(
			model.id,
			model.userId,
			model.trackerId,
			dateIso,
			new WorkStatus(model.status),
			model.notes,
			model.isAdvisory,
			model.createdAt,
			model.updatedAt
		);
	},

	toModel(entry: WorkEntry): {
		date: string;
		status: string;
		isAdvisory: boolean;
		notes?: string;
		createdAt: number;
		updatedAt: number;
		userId: string;
		trackerId: string;
	} {
		return {
			date: entry.date,
			status: entry.status.value,
			isAdvisory: entry.isAdvisory,
			notes: entry.notes,
			createdAt: entry.createdAt.getTime(),
			updatedAt: entry.updatedAt.getTime(),
			userId: entry.userId,
			trackerId: entry.trackerId,
		};
	},
};
